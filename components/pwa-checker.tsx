"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export function PWAChecker() {
  const [checks, setChecks] = useState({
    https: false,
    manifest: false,
    serviceWorker: false,
    icons: false,
    installable: false,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkPWARequirements = async () => {
      try {
        // HTTPS 확인
        const isHttps = window.location.protocol === "https:" || window.location.hostname === "localhost"

        // 매니페스트 확인
        let hasManifest = false
        const manifestLinks = document.querySelectorAll('link[rel="manifest"]')
        if (manifestLinks.length > 0) {
          try {
            const manifestUrl = manifestLinks[0].getAttribute("href")
            if (manifestUrl) {
              const response = await fetch(manifestUrl)
              const manifest = await response.json()
              hasManifest = manifest && manifest.name && manifest.icons && manifest.icons.length > 0
            }
          } catch (e) {
            console.error("매니페스트 확인 중 오류:", e)
          }
        }

        // 서비스 워커 확인
        const hasServiceWorker = "serviceWorker" in navigator
        let serviceWorkerRegistered = false

        if (hasServiceWorker) {
          try {
            const registrations = await navigator.serviceWorker.getRegistrations()
            serviceWorkerRegistered = registrations.length > 0
          } catch (e) {
            console.error("서비스 워커 확인 중 오류:", e)
          }
        }

        // 아이콘 확인
        let hasIcons = false
        if (hasManifest) {
          const manifestUrl = document.querySelector('link[rel="manifest"]')?.getAttribute("href")
          if (manifestUrl) {
            const response = await fetch(manifestUrl)
            const manifest = await response.json()
            hasIcons = manifest.icons && manifest.icons.length >= 2
          }
        }

        // 설치 가능 여부 확인
        const isInstallable = isHttps && hasManifest && serviceWorkerRegistered && hasIcons

        setChecks({
          https: isHttps,
          manifest: hasManifest,
          serviceWorker: serviceWorkerRegistered,
          icons: hasIcons,
          installable: isInstallable,
        })

        setLoading(false)
      } catch (error) {
        console.error("PWA 요구사항 확인 중 오류:", error)
        setLoading(false)
      }
    }

    if (typeof window !== "undefined") {
      checkPWARequirements()
    }
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">PWA 설치 가능 여부 확인 중...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">PWA 설치 가능 여부</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          <li className="flex items-center">
            {checks.https ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
            )}
            <span>HTTPS 사용</span>
          </li>
          <li className="flex items-center">
            {checks.manifest ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
            )}
            <span>Web App Manifest</span>
          </li>
          <li className="flex items-center">
            {checks.serviceWorker ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
            )}
            <span>서비스 워커</span>
          </li>
          <li className="flex items-center">
            {checks.icons ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
            )}
            <span>아이콘</span>
          </li>
          <li className="flex items-center">
            {checks.installable ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
            )}
            <span>설치 가능</span>
          </li>
        </ul>

        {!checks.installable && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-800">PWA 설치를 위해 다음 요구사항을 충족해야 합니다:</p>
              <ul className="text-xs text-amber-700 mt-1 list-disc pl-4">
                {!checks.https && <li>HTTPS 연결이 필요합니다</li>}
                {!checks.manifest && <li>유효한 Web App Manifest가 필요합니다</li>}
                {!checks.serviceWorker && <li>서비스 워커가 등록되어야 합니다</li>}
                {!checks.icons && <li>다양한 크기의 아이콘이 필요합니다</li>}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

