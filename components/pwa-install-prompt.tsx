"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Smartphone, Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [installSupported, setInstallSupported] = useState(true)
  const [installationStatus, setInstallationStatus] = useState<"idle" | "installing" | "success" | "error">("idle")

  useEffect(() => {
    // PWA가 이미 설치되어 있는지 확인
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    // beforeinstallprompt 이벤트 리스너 등록
    const handleBeforeInstallPrompt = (e: Event) => {
      // 브라우저 기본 설치 프롬프트 방지
      e.preventDefault()
      // 이벤트 저장
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // 설치 지원 확인
      setInstallSupported(true)
      // 사용자가 이전에 프롬프트를 닫지 않았다면 프롬프트 표시
      const promptClosed = localStorage.getItem("pwaPromptClosed")
      if (!promptClosed || Date.now() > Number.parseInt(promptClosed) + 7 * 24 * 60 * 60 * 1000) {
        setShowPrompt(true)
      }
    }

    // appinstalled 이벤트 리스너 등록
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setInstallationStatus("success")
      // 설치 성공 메시지 표시 후 3초 후에 숨김
      setTimeout(() => {
        setInstallationStatus("idle")
      }, 3000)
    }

    if (typeof window !== "undefined") {
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.addEventListener("appinstalled", handleAppInstalled)

      // 5초 후에도 beforeinstallprompt 이벤트가 발생하지 않으면 설치가 지원되지 않는 것으로 간주
      const timer = setTimeout(() => {
        if (!deferredPrompt) {
          setInstallSupported(false)
        }
      }, 5000)

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
        window.removeEventListener("appinstalled", handleAppInstalled)
        clearTimeout(timer)
      }
    }
  }, [deferredPrompt])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // iOS Safari와 같이 beforeinstallprompt를 지원하지 않는 브라우저에 대한 안내
      if (!installSupported) {
        alert(
          "이 브라우저에서는 자동 설치가 지원되지 않습니다. 브라우저의 '공유' 또는 '홈 화면에 추가' 기능을 사용해 주세요.",
        )
        setShowPrompt(false)
        return
      }
      return
    }

    setInstallationStatus("installing")

    try {
      // 설치 프롬프트 표시
      await deferredPrompt.prompt()

      // 사용자 선택 결과 확인
      const choiceResult = await deferredPrompt.userChoice

      if (choiceResult.outcome === "accepted") {
        console.log("사용자가 앱 설치를 수락했습니다")
        setInstallationStatus("success")
        setIsInstalled(true)
      } else {
        console.log("사용자가 앱 설치를 거부했습니다")
        setInstallationStatus("idle")
      }
    } catch (error) {
      console.error("설치 중 오류 발생:", error)
      setInstallationStatus("error")
    }

    // 프롬프트 사용 후 초기화
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleClosePrompt = () => {
    setShowPrompt(false)
    // 7일 동안 프롬프트 다시 표시하지 않음
    localStorage.setItem("pwaPromptClosed", Date.now().toString())
  }

  // 설치 성공 메시지
  if (installationStatus === "success" && !showPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
        <Card className="border-green-500 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Check className="h-6 w-6 text-green-500 mr-2" />
              <div>
                <h3 className="text-base font-medium">설치 완료!</h3>
                <p className="text-sm text-muted-foreground">앱이 성공적으로 설치되었습니다.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // iOS 사용자를 위한 안내 메시지
  const isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

  if (!showPrompt || isInstalled) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <Card className="border-primary/20 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-base font-medium mb-1">앱 설치하기</h3>
              <p className="text-sm text-muted-foreground mb-3">
                출석 관리 시스템을 홈 화면에 설치하여 더 빠르게 접근하세요.
              </p>

              {isIOS ? (
                <div className="space-y-2">
                  <p className="text-xs text-amber-600">
                    iOS에서는 Safari 브라우저의 "공유" 버튼을 누른 후 "홈 화면에 추가"를 선택하세요.
                  </p>
                  <Button size="sm" variant="outline" className="w-full" onClick={handleClosePrompt}>
                    <Check className="mr-2 h-4 w-4" />
                    확인했습니다
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white"
                  onClick={handleInstallClick}
                  disabled={installationStatus === "installing"}
                >
                  {installationStatus === "installing" ? (
                    <>설치 중...</>
                  ) : (
                    <>
                      <Smartphone className="mr-2 h-4 w-4" />앱 설치하기
                    </>
                  )}
                </Button>
              )}
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClosePrompt}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

