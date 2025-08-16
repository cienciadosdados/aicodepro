import type { Metadata, Viewport } from 'next';
import './globals.css';
import './mobile-optimizations.css';
import { inter } from './fonts';
import Script from 'next/script';
import { headers } from 'next/headers';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
  minimumScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'AI Code Pro - IA de Verdade. Para Quem Já Programa.',
  description: 'Aprenda a desenvolver soluções avançadas com LLM, MCP, RAG, VectorDB, Embedding e Agentes de IA usando ferramentas como CrewAI e LangGraph.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' }
    ]
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'AI Code Pro - IA de Verdade. Para Quem Já Programa.',
    description: 'Aprenda a desenvolver soluções avançadas com LLM, MCP, RAG, VectorDB, Embedding e Agentes de IA usando ferramentas como CrewAI e LangGraph.',
    url: 'https://aicodepro.com/',
    siteName: 'AI Code Pro',
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Adicionar timestamp para forçar o navegador a ignorar o cache
  const timestamp = Date.now();
  
  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta http-equiv="Pragma" content="no-cache" />
        <meta http-equiv="Expires" content="0" />
        <meta name="version" content={`${timestamp}`} />
        
        {/* Preload de recursos críticos */}
        <link
          rel="preload"
          href="/images/hero-bg.webp"
          as="image"
          type="image/webp"
          fetchPriority="high"
        />
        <link
          rel="preconnect" 
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link 
          rel="preconnect" 
          href="https://fonts.gstatic.com" 
          crossOrigin="anonymous"
        />
        
        {/* DNS Prefetch para domínios externos */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Cache-Control header */}
        <meta httpEquiv="Cache-Control" content="public, max-age=31536000, immutable" />
        
        {/* Otimizações para mobile */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Detecção de conexão lenta - Movido para afterInteractive para não bloquear renderização */}
        <Script id="connection-detection" strategy="afterInteractive">
          {`
            // Detectar conexão lenta e adicionar classe para otimizações
            if ('connection' in navigator) {
              if (navigator.connection.saveData || 
                  navigator.connection.effectiveType === 'slow-2g' || 
                  navigator.connection.effectiveType === '2g' || 
                  navigator.connection.effectiveType === '3g') {
                document.documentElement.classList.add('save-data');
              }
            }
          `}
        </Script>
        
        {/* Service Worker Registration - Carregado de forma assíncrona para não bloquear renderização */}
        <Script 
          id="register-service-worker" 
          src="/register-sw.js"
          strategy="lazyOnload"
        />
        
        {/* Scripts de otimização para dispositivos móveis */}
        <script 
          dangerouslySetInnerHTML={{
            __html: `
              // Detectar conexão lenta
              (function() {
                function detectSlowConnection() {
                  if ('connection' in navigator) {
                    const conn = navigator.connection;
                    if (conn.saveData || 
                        conn.effectiveType === 'slow-2g' || 
                        conn.effectiveType === '2g' || 
                        conn.effectiveType === '3g') {
                      document.documentElement.classList.add('slow-connection');
                      return true;
                    }
                  }
                  return false;
                }
                
                const isSlowConnection = detectSlowConnection();
                
                // Desativar animações em conexões lentas
                if (isSlowConnection) {
                  document.documentElement.classList.add('reduce-motion');
                }
                
                // Detectar dispositivo móvel
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
                if (isMobile) {
                  document.documentElement.classList.add('mobile-device');
                }
              })();
            `
          }}
        />
        
        {/* Script de rastreamento UTM simplificado */}
        <Script id="utm-tracking" strategy="lazyOnload">
          {`
            function getParameterByName(name) {
              var url = window.location.href;
              name = name.replace(/[\\[\\]]/g, '\\\\$&');
              var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
                  results = regex.exec(url);
              if (!results) return null;
              if (!results[2]) return '';
              return decodeURIComponent(results[2].replace(/\\+/g, ' '));
            }

            function saveUtmParams() {
              var utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
              var savedParams = {};
              
              utmParams.forEach(function(param) {
                var value = getParameterByName(param);
                if (value) {
                  savedParams[param] = value;
                  localStorage.setItem(param, value);
                } else if (localStorage.getItem(param)) {
                  savedParams[param] = localStorage.getItem(param);
                }
              });
              
              return savedParams;
            }

            // Save UTM parameters when page loads
            var utmParams = saveUtmParams();
            
            // Add UTM params to all forms
            document.querySelectorAll('form').forEach(function(form) {
              for (var param in utmParams) {
                if (utmParams.hasOwnProperty(param)) {
                  var input = document.createElement('input');
                  input.type = 'hidden';
                  input.name = param;
                  input.value = utmParams[param];
                  form.appendChild(input);
                }
              }
            });
          `}
        </Script>
        
        {/* Umami Analytics - Privacy-focused */}
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="4c191d02-dec4-46fb-8b2f-4348179a5706"
          strategy="afterInteractive"
          defer
        />

        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-K39VWGP4CN"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-K39VWGP4CN', {
              page_title: document.title,
              page_location: window.location.href
            });
          `}
        </Script>

        {/* Google Tag Manager - Movido para depois do conteúdo principal */}
        <Script id="google-tag-manager" strategy="lazyOnload">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-5DXNNZXX');
          `}
        </Script>
        
        {/* Facebook Pixel Code */}
        <Script id="facebook-pixel" strategy="lazyOnload">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '2881836401882483');
            fbq('track', 'PageView');
          `}
        </Script>
        
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-5DXNNZXX"
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        
        {/* Facebook Pixel (noscript) */}
        <noscript>
          <img 
            height="1" 
            width="1" 
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=2881836401882483&ev=PageView&noscript=1"
            alt="Facebook Pixel"
          />
        </noscript>
        
        {/* Preload critical resources */}
        <link rel="preload" as="image" href="/hero-bg.webp" />
        <link rel="preload" as="font" href="/fonts/inter-var.woff2" type="font/woff2" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        
        {/* Meta tags for performance */}
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
        <meta name="theme-color" content="#000000" />
        
        {/* Inline critical CSS */}
        <style dangerouslySetInnerHTML={{ __html: `
          body { background-color: #000; color: #fff; }
          .critical-hidden { opacity: 0; }
          .critical-visible { opacity: 1; transition: opacity 0.3s; }
        `}} />
      </head>
      <body className={inter.className}>
        {/* Conteúdo principal primeiro, scripts depois */}
        {children}
        
        {/* Scripts não-críticos foram removidos para evitar problemas de cache */}
        
        {/* Carregar service worker */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) {
                    console.log('ServiceWorker registration successful');
                  },
                  function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  }
                );
              });
            }
          `}
        </Script>
        
        {/* Scripts de otimização */}
        <Script src="/register-sw.js" strategy="lazyOnload" />
        <Script src="/image-optimizer.js" strategy="lazyOnload" />
        <Script src="/font-optimizer.js" strategy="lazyOnload" />
        <Script src="/css-optimizer.js" strategy="lazyOnload" />
        <Script src="/text-updater.js" strategy="lazyOnload" />
        <Script src="/cache-buster.js" strategy="lazyOnload" />
      </body>
    </html>
  )
}
