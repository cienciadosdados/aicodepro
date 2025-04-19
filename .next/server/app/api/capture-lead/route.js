/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/capture-lead/route";
exports.ids = ["app/api/capture-lead/route"];
exports.modules = {

/***/ "(rsc)/./app/api/capture-lead/route.ts":
/*!***************************************!*\
  !*** ./app/api/capture-lead/route.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_supabase_storage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/supabase-storage */ \"(rsc)/./lib/supabase-storage.js\");\n\n\nasync function POST(req) {\n    try {\n        const body = await req.json();\n        console.log(' recebido no corpo da requisição da API');\n        console.log(body);\n        const { email, phone, isProgrammer, utm_source, utm_medium, utm_campaign } = body;\n        const HOTMART_WEBHOOK_URL = process.env.HOTMART_WEBHOOK_URL;\n        if (!HOTMART_WEBHOOK_URL) {\n            console.error('HOTMART_WEBHOOK_URL não configurada');\n        }\n        if (HOTMART_WEBHOOK_URL) {\n            console.log('Enviando para Hotmart...');\n            const hotmartPayload = {\n                name: body.name || email,\n                email: email,\n                phone: phone\n            };\n            console.log('Payload Hotmart:', hotmartPayload);\n            const response = await fetch(HOTMART_WEBHOOK_URL, {\n                method: 'POST',\n                headers: {\n                    'Content-Type': 'application/json'\n                },\n                body: JSON.stringify(hotmartPayload)\n            });\n            if (!response.ok) {\n                console.error('Erro ao enviar para Hotmart. Status:', response.status);\n                const errorBody = await response.text();\n                console.error('Corpo do erro Hotmart:', errorBody);\n            } else {\n                console.log('✅ Enviado para Hotmart com sucesso!');\n            }\n        } else {\n            console.warn('URL do webhook Hotmart não configurada. Pulando envio.');\n        }\n        console.log('Tentando salvar lead qualificado no Supabase...');\n        const leadData = {\n            email,\n            phone,\n            isProgrammer,\n            utmSource: utm_source,\n            utmMedium: utm_medium,\n            utmCampaign: utm_campaign\n        };\n        console.log('Dados para salvar no Neon:', leadData);\n        try {\n            const savedLead = await (0,_lib_supabase_storage__WEBPACK_IMPORTED_MODULE_1__.saveQualifiedLead)(leadData);\n            console.log('✅ Lead salvo no Supabase com sucesso:', savedLead.email);\n        } catch (dbError) {\n            console.error('❌ Erro ao salvar lead no Supabase:', dbError);\n        }\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: true,\n            message: 'Lead processado.'\n        });\n    } catch (error) {\n        console.error('Erro GERAL ao processar lead:', error);\n        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: false,\n            error: 'Erro interno ao processar inscrição',\n            details: errorMessage\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2NhcHR1cmUtbGVhZC9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBMkM7QUFDZ0I7QUFFcEQsZUFBZUUsS0FBS0MsR0FBWTtJQUNyQyxJQUFJO1FBQ0YsTUFBTUMsT0FBTyxNQUFNRCxJQUFJRSxJQUFJO1FBQzNCQyxRQUFRQyxHQUFHLENBQUM7UUFDWkQsUUFBUUMsR0FBRyxDQUFDSDtRQUVaLE1BQU0sRUFBRUksS0FBSyxFQUFFQyxLQUFLLEVBQUVDLFlBQVksRUFBRUMsVUFBVSxFQUFFQyxVQUFVLEVBQUVDLFlBQVksRUFBRSxHQUFHVDtRQUU3RSxNQUFNVSxzQkFBc0JDLFFBQVFDLEdBQUcsQ0FBQ0YsbUJBQW1CO1FBQzNELElBQUksQ0FBQ0EscUJBQXFCO1lBQ3hCUixRQUFRVyxLQUFLLENBQUM7UUFDaEI7UUFFQSxJQUFJSCxxQkFBcUI7WUFDdkJSLFFBQVFDLEdBQUcsQ0FBQztZQUNaLE1BQU1XLGlCQUFpQjtnQkFDckJDLE1BQU1mLEtBQUtlLElBQUksSUFBSVg7Z0JBQ25CQSxPQUFPQTtnQkFDUEMsT0FBT0E7WUFDVDtZQUNBSCxRQUFRQyxHQUFHLENBQUMsb0JBQW9CVztZQUVoQyxNQUFNRSxXQUFXLE1BQU1DLE1BQU1QLHFCQUFxQjtnQkFDaERRLFFBQVE7Z0JBQ1JDLFNBQVM7b0JBQ1AsZ0JBQWdCO2dCQUNsQjtnQkFDQW5CLE1BQU1vQixLQUFLQyxTQUFTLENBQUNQO1lBQ3ZCO1lBRUEsSUFBSSxDQUFDRSxTQUFTTSxFQUFFLEVBQUU7Z0JBQ2hCcEIsUUFBUVcsS0FBSyxDQUFDLHdDQUF3Q0csU0FBU08sTUFBTTtnQkFDckUsTUFBTUMsWUFBWSxNQUFNUixTQUFTUyxJQUFJO2dCQUNyQ3ZCLFFBQVFXLEtBQUssQ0FBQywwQkFBMEJXO1lBQzFDLE9BQU87Z0JBQ0x0QixRQUFRQyxHQUFHLENBQUM7WUFDZDtRQUNGLE9BQU87WUFDTEQsUUFBUXdCLElBQUksQ0FBQztRQUNmO1FBRUF4QixRQUFRQyxHQUFHLENBQUM7UUFDWixNQUFNd0IsV0FBVztZQUNmdkI7WUFDQUM7WUFDQUM7WUFDQXNCLFdBQVdyQjtZQUNYc0IsV0FBV3JCO1lBQ1hzQixhQUFhckI7UUFDZjtRQUNBUCxRQUFRQyxHQUFHLENBQUMsOEJBQThCd0I7UUFFMUMsSUFBSTtZQUNGLE1BQU1JLFlBQVksTUFBTWxDLHdFQUFpQkEsQ0FBQzhCO1lBQzFDekIsUUFBUUMsR0FBRyxDQUFDLHlDQUF5QzRCLFVBQVUzQixLQUFLO1FBQ3RFLEVBQUUsT0FBTzRCLFNBQVM7WUFDaEI5QixRQUFRVyxLQUFLLENBQUMsc0NBQXNDbUI7UUFDdEQ7UUFFQSxPQUFPcEMscURBQVlBLENBQUNLLElBQUksQ0FBQztZQUFFZ0MsU0FBUztZQUFNQyxTQUFTO1FBQW1CO0lBRXhFLEVBQUUsT0FBT3JCLE9BQU87UUFDZFgsUUFBUVcsS0FBSyxDQUFDLGlDQUFpQ0E7UUFDL0MsTUFBTXNCLGVBQWV0QixpQkFBaUJ1QixRQUFRdkIsTUFBTXFCLE9BQU8sR0FBRztRQUM5RCxPQUFPdEMscURBQVlBLENBQUNLLElBQUksQ0FDdEI7WUFBRWdDLFNBQVM7WUFBT3BCLE9BQU87WUFBdUN3QixTQUFTRjtRQUFhLEdBQ3RGO1lBQUVaLFFBQVE7UUFBSTtJQUVsQjtBQUNGIiwic291cmNlcyI6WyJDOlxcc2l0ZXNcXGFpY29kZXByb1xcYXBwXFxhcGlcXGNhcHR1cmUtbGVhZFxccm91dGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlc3BvbnNlIH0gZnJvbSAnbmV4dC9zZXJ2ZXInO1xuaW1wb3J0IHsgc2F2ZVF1YWxpZmllZExlYWQgfSBmcm9tICdAL2xpYi9zdXBhYmFzZS1zdG9yYWdlJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFBPU1QocmVxOiBSZXF1ZXN0KSB7XG4gIHRyeSB7XG4gICAgY29uc3QgYm9keSA9IGF3YWl0IHJlcS5qc29uKCk7XG4gICAgY29uc29sZS5sb2coJyByZWNlYmlkbyBubyBjb3JwbyBkYSByZXF1aXNpw6fDo28gZGEgQVBJJyk7XG4gICAgY29uc29sZS5sb2coYm9keSk7XG4gICAgXG4gICAgY29uc3QgeyBlbWFpbCwgcGhvbmUsIGlzUHJvZ3JhbW1lciwgdXRtX3NvdXJjZSwgdXRtX21lZGl1bSwgdXRtX2NhbXBhaWduIH0gPSBib2R5O1xuXG4gICAgY29uc3QgSE9UTUFSVF9XRUJIT09LX1VSTCA9IHByb2Nlc3MuZW52LkhPVE1BUlRfV0VCSE9PS19VUkw7XG4gICAgaWYgKCFIT1RNQVJUX1dFQkhPT0tfVVJMKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdIT1RNQVJUX1dFQkhPT0tfVVJMIG7Do28gY29uZmlndXJhZGEnKTtcbiAgICB9XG5cbiAgICBpZiAoSE9UTUFSVF9XRUJIT09LX1VSTCkge1xuICAgICAgY29uc29sZS5sb2coJ0VudmlhbmRvIHBhcmEgSG90bWFydC4uLicpO1xuICAgICAgY29uc3QgaG90bWFydFBheWxvYWQgPSB7XG4gICAgICAgIG5hbWU6IGJvZHkubmFtZSB8fCBlbWFpbCxcbiAgICAgICAgZW1haWw6IGVtYWlsLFxuICAgICAgICBwaG9uZTogcGhvbmUsXG4gICAgICB9O1xuICAgICAgY29uc29sZS5sb2coJ1BheWxvYWQgSG90bWFydDonLCBob3RtYXJ0UGF5bG9hZCk7XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goSE9UTUFSVF9XRUJIT09LX1VSTCwge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgIH0sXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGhvdG1hcnRQYXlsb2FkKSxcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm8gYW8gZW52aWFyIHBhcmEgSG90bWFydC4gU3RhdHVzOicsIHJlc3BvbnNlLnN0YXR1cyk7XG4gICAgICAgIGNvbnN0IGVycm9yQm9keSA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignQ29ycG8gZG8gZXJybyBIb3RtYXJ0OicsIGVycm9yQm9keSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZygn4pyFIEVudmlhZG8gcGFyYSBIb3RtYXJ0IGNvbSBzdWNlc3NvIScpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1VSTCBkbyB3ZWJob29rIEhvdG1hcnQgbsOjbyBjb25maWd1cmFkYS4gUHVsYW5kbyBlbnZpby4nKTtcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZygnVGVudGFuZG8gc2FsdmFyIGxlYWQgcXVhbGlmaWNhZG8gbm8gU3VwYWJhc2UuLi4nKTtcbiAgICBjb25zdCBsZWFkRGF0YSA9IHtcbiAgICAgIGVtYWlsLFxuICAgICAgcGhvbmUsXG4gICAgICBpc1Byb2dyYW1tZXIsXG4gICAgICB1dG1Tb3VyY2U6IHV0bV9zb3VyY2UsXG4gICAgICB1dG1NZWRpdW06IHV0bV9tZWRpdW0sXG4gICAgICB1dG1DYW1wYWlnbjogdXRtX2NhbXBhaWduLFxuICAgIH07XG4gICAgY29uc29sZS5sb2coJ0RhZG9zIHBhcmEgc2FsdmFyIG5vIE5lb246JywgbGVhZERhdGEpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNhdmVkTGVhZCA9IGF3YWl0IHNhdmVRdWFsaWZpZWRMZWFkKGxlYWREYXRhKTtcbiAgICAgIGNvbnNvbGUubG9nKCfinIUgTGVhZCBzYWx2byBubyBTdXBhYmFzZSBjb20gc3VjZXNzbzonLCBzYXZlZExlYWQuZW1haWwpO1xuICAgIH0gY2F0Y2ggKGRiRXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ+KdjCBFcnJvIGFvIHNhbHZhciBsZWFkIG5vIFN1cGFiYXNlOicsIGRiRXJyb3IpO1xuICAgIH1cblxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IHN1Y2Nlc3M6IHRydWUsIG1lc3NhZ2U6ICdMZWFkIHByb2Nlc3NhZG8uJyB9KTtcblxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm8gR0VSQUwgYW8gcHJvY2Vzc2FyIGxlYWQ6JywgZXJyb3IpO1xuICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ0Vycm8gZGVzY29uaGVjaWRvJztcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0Vycm8gaW50ZXJubyBhbyBwcm9jZXNzYXIgaW5zY3Jpw6fDo28nLCBkZXRhaWxzOiBlcnJvck1lc3NhZ2UgfSxcbiAgICAgIHsgc3RhdHVzOiA1MDAgfVxuICAgICk7XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJzYXZlUXVhbGlmaWVkTGVhZCIsIlBPU1QiLCJyZXEiLCJib2R5IiwianNvbiIsImNvbnNvbGUiLCJsb2ciLCJlbWFpbCIsInBob25lIiwiaXNQcm9ncmFtbWVyIiwidXRtX3NvdXJjZSIsInV0bV9tZWRpdW0iLCJ1dG1fY2FtcGFpZ24iLCJIT1RNQVJUX1dFQkhPT0tfVVJMIiwicHJvY2VzcyIsImVudiIsImVycm9yIiwiaG90bWFydFBheWxvYWQiLCJuYW1lIiwicmVzcG9uc2UiLCJmZXRjaCIsIm1ldGhvZCIsImhlYWRlcnMiLCJKU09OIiwic3RyaW5naWZ5Iiwib2siLCJzdGF0dXMiLCJlcnJvckJvZHkiLCJ0ZXh0Iiwid2FybiIsImxlYWREYXRhIiwidXRtU291cmNlIiwidXRtTWVkaXVtIiwidXRtQ2FtcGFpZ24iLCJzYXZlZExlYWQiLCJkYkVycm9yIiwic3VjY2VzcyIsIm1lc3NhZ2UiLCJlcnJvck1lc3NhZ2UiLCJFcnJvciIsImRldGFpbHMiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/capture-lead/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/supabase-storage.js":
/*!*********************************!*\
  !*** ./lib/supabase-storage.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   saveQualifiedLead: () => (/* binding */ saveQualifiedLead),\n/* harmony export */   testDatabaseConnection: () => (/* binding */ testDatabaseConnection)\n/* harmony export */ });\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @supabase/supabase-js */ \"(rsc)/./node_modules/@supabase/supabase-js/dist/module/index.js\");\n/* harmony import */ var dotenv_config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! dotenv/config */ \"(rsc)/./node_modules/dotenv/config.js\");\n/* harmony import */ var dotenv_config__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(dotenv_config__WEBPACK_IMPORTED_MODULE_0__);\n// Integração com Supabase para armazenamento de leads\n\n\nconst supabase = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__.createClient)(\"https://nmweydircrhrsyhiuhbv.supabase.co\", process.env.SUPABASE_SERVICE_ROLE_KEY, {\n    auth: {\n        persistSession: false\n    }\n});\nasync function saveQualifiedLead(leadData) {\n    const { data, error } = await supabase.from('qualified_leads').insert([\n        {\n            email: leadData.email,\n            phone: leadData.phone,\n            is_programmer: leadData.isProgrammer,\n            utm_source: leadData.utmSource,\n            utm_medium: leadData.utmMedium,\n            utm_campaign: leadData.utmCampaign,\n            ip_address: leadData.ipAddress,\n            user_agent: leadData.userAgent\n        }\n    ]).select();\n    if (error) throw error;\n    return data[0];\n}\nasync function testDatabaseConnection() {\n    const { count, error } = await supabase.from('qualified_leads').select('*', {\n        count: 'exact',\n        head: true\n    });\n    return {\n        success: !error,\n        message: error ? `Erro de conexão: ${error.message}` : 'Conexão com Supabase estabelecida com sucesso'\n    };\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvc3VwYWJhc2Utc3RvcmFnZS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBLHNEQUFzRDtBQUNGO0FBQzlCO0FBRXRCLE1BQU1DLFdBQVdELG1FQUFZQSxDQUMzQkUsMENBQW9DLEVBQ3BDQSxRQUFRQyxHQUFHLENBQUNFLHlCQUF5QixFQUNyQztJQUNFQyxNQUFNO1FBQ0pDLGdCQUFnQjtJQUNsQjtBQUNGO0FBR0ssZUFBZUMsa0JBQWtCQyxRQUFRO0lBQzlDLE1BQU0sRUFBRUMsSUFBSSxFQUFFQyxLQUFLLEVBQUUsR0FBRyxNQUFNVixTQUMzQlcsSUFBSSxDQUFDLG1CQUNMQyxNQUFNLENBQUM7UUFBQztZQUNQQyxPQUFPTCxTQUFTSyxLQUFLO1lBQ3JCQyxPQUFPTixTQUFTTSxLQUFLO1lBQ3JCQyxlQUFlUCxTQUFTUSxZQUFZO1lBQ3BDQyxZQUFZVCxTQUFTVSxTQUFTO1lBQzlCQyxZQUFZWCxTQUFTWSxTQUFTO1lBQzlCQyxjQUFjYixTQUFTYyxXQUFXO1lBQ2xDQyxZQUFZZixTQUFTZ0IsU0FBUztZQUM5QkMsWUFBWWpCLFNBQVNrQixTQUFTO1FBQ2hDO0tBQUUsRUFDREMsTUFBTTtJQUVULElBQUlqQixPQUFPLE1BQU1BO0lBQ2pCLE9BQU9ELElBQUksQ0FBQyxFQUFFO0FBQ2hCO0FBRU8sZUFBZW1CO0lBQ3BCLE1BQU0sRUFBRUMsS0FBSyxFQUFFbkIsS0FBSyxFQUFFLEdBQUcsTUFBTVYsU0FDNUJXLElBQUksQ0FBQyxtQkFDTGdCLE1BQU0sQ0FBQyxLQUFLO1FBQUVFLE9BQU87UUFBU0MsTUFBTTtJQUFLO0lBRTVDLE9BQU87UUFDTEMsU0FBUyxDQUFDckI7UUFDVnNCLFNBQVN0QixRQUFRLENBQUMsaUJBQWlCLEVBQUVBLE1BQU1zQixPQUFPLEVBQUUsR0FBRztJQUN6RDtBQUNGIiwic291cmNlcyI6WyJDOlxcc2l0ZXNcXGFpY29kZXByb1xcbGliXFxzdXBhYmFzZS1zdG9yYWdlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIEludGVncmHDp8OjbyBjb20gU3VwYWJhc2UgcGFyYSBhcm1hemVuYW1lbnRvIGRlIGxlYWRzXHJcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcydcclxuaW1wb3J0ICdkb3RlbnYvY29uZmlnJ1xyXG5cclxuY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVDbGllbnQoXHJcbiAgcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMLFxyXG4gIHByb2Nlc3MuZW52LlNVUEFCQVNFX1NFUlZJQ0VfUk9MRV9LRVksXHJcbiAge1xyXG4gICAgYXV0aDoge1xyXG4gICAgICBwZXJzaXN0U2Vzc2lvbjogZmFsc2VcclxuICAgIH1cclxuICB9XHJcbilcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlUXVhbGlmaWVkTGVhZChsZWFkRGF0YSkge1xyXG4gIGNvbnN0IHsgZGF0YSwgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgncXVhbGlmaWVkX2xlYWRzJylcclxuICAgIC5pbnNlcnQoW3tcclxuICAgICAgZW1haWw6IGxlYWREYXRhLmVtYWlsLFxyXG4gICAgICBwaG9uZTogbGVhZERhdGEucGhvbmUsXHJcbiAgICAgIGlzX3Byb2dyYW1tZXI6IGxlYWREYXRhLmlzUHJvZ3JhbW1lcixcclxuICAgICAgdXRtX3NvdXJjZTogbGVhZERhdGEudXRtU291cmNlLFxyXG4gICAgICB1dG1fbWVkaXVtOiBsZWFkRGF0YS51dG1NZWRpdW0sXHJcbiAgICAgIHV0bV9jYW1wYWlnbjogbGVhZERhdGEudXRtQ2FtcGFpZ24sXHJcbiAgICAgIGlwX2FkZHJlc3M6IGxlYWREYXRhLmlwQWRkcmVzcyxcclxuICAgICAgdXNlcl9hZ2VudDogbGVhZERhdGEudXNlckFnZW50XHJcbiAgICB9XSlcclxuICAgIC5zZWxlY3QoKVxyXG5cclxuICBpZiAoZXJyb3IpIHRocm93IGVycm9yXHJcbiAgcmV0dXJuIGRhdGFbMF1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHRlc3REYXRhYmFzZUNvbm5lY3Rpb24oKSB7XHJcbiAgY29uc3QgeyBjb3VudCwgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAuZnJvbSgncXVhbGlmaWVkX2xlYWRzJylcclxuICAgIC5zZWxlY3QoJyonLCB7IGNvdW50OiAnZXhhY3QnLCBoZWFkOiB0cnVlIH0pXHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBzdWNjZXNzOiAhZXJyb3IsXHJcbiAgICBtZXNzYWdlOiBlcnJvciA/IGBFcnJvIGRlIGNvbmV4w6NvOiAke2Vycm9yLm1lc3NhZ2V9YCA6ICdDb25leMOjbyBjb20gU3VwYWJhc2UgZXN0YWJlbGVjaWRhIGNvbSBzdWNlc3NvJ1xyXG4gIH1cclxufVxyXG4iXSwibmFtZXMiOlsiY3JlYXRlQ2xpZW50Iiwic3VwYWJhc2UiLCJwcm9jZXNzIiwiZW52IiwiTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMIiwiU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWSIsImF1dGgiLCJwZXJzaXN0U2Vzc2lvbiIsInNhdmVRdWFsaWZpZWRMZWFkIiwibGVhZERhdGEiLCJkYXRhIiwiZXJyb3IiLCJmcm9tIiwiaW5zZXJ0IiwiZW1haWwiLCJwaG9uZSIsImlzX3Byb2dyYW1tZXIiLCJpc1Byb2dyYW1tZXIiLCJ1dG1fc291cmNlIiwidXRtU291cmNlIiwidXRtX21lZGl1bSIsInV0bU1lZGl1bSIsInV0bV9jYW1wYWlnbiIsInV0bUNhbXBhaWduIiwiaXBfYWRkcmVzcyIsImlwQWRkcmVzcyIsInVzZXJfYWdlbnQiLCJ1c2VyQWdlbnQiLCJzZWxlY3QiLCJ0ZXN0RGF0YWJhc2VDb25uZWN0aW9uIiwiY291bnQiLCJoZWFkIiwic3VjY2VzcyIsIm1lc3NhZ2UiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/supabase-storage.js\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcapture-lead%2Froute&page=%2Fapi%2Fcapture-lead%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcapture-lead%2Froute.ts&appDir=C%3A%5Csites%5Caicodepro%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5Csites%5Caicodepro&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcapture-lead%2Froute&page=%2Fapi%2Fcapture-lead%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcapture-lead%2Froute.ts&appDir=C%3A%5Csites%5Caicodepro%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5Csites%5Caicodepro&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_sites_aicodepro_app_api_capture_lead_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/capture-lead/route.ts */ \"(rsc)/./app/api/capture-lead/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/capture-lead/route\",\n        pathname: \"/api/capture-lead\",\n        filename: \"route\",\n        bundlePath: \"app/api/capture-lead/route\"\n    },\n    resolvedPagePath: \"C:\\\\sites\\\\aicodepro\\\\app\\\\api\\\\capture-lead\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_sites_aicodepro_app_api_capture_lead_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZjYXB0dXJlLWxlYWQlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmNhcHR1cmUtbGVhZCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmNhcHR1cmUtbGVhZCUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDc2l0ZXMlNUNhaWNvZGVwcm8lNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUMlM0ElNUNzaXRlcyU1Q2FpY29kZXBybyZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBK0Y7QUFDdkM7QUFDcUI7QUFDTTtBQUNuRjtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHNEQUFzRDtBQUM5RDtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUMwRjs7QUFFMUYiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiQzpcXFxcc2l0ZXNcXFxcYWljb2RlcHJvXFxcXGFwcFxcXFxhcGlcXFxcY2FwdHVyZS1sZWFkXFxcXHJvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9jYXB0dXJlLWxlYWQvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9jYXB0dXJlLWxlYWRcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL2NhcHR1cmUtbGVhZC9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkM6XFxcXHNpdGVzXFxcXGFpY29kZXByb1xcXFxhcHBcXFxcYXBpXFxcXGNhcHR1cmUtbGVhZFxcXFxyb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHdvcmtBc3luY1N0b3JhZ2UsXG4gICAgICAgIHdvcmtVbml0QXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcapture-lead%2Froute&page=%2Fapi%2Fcapture-lead%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcapture-lead%2Froute.ts&appDir=C%3A%5Csites%5Caicodepro%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5Csites%5Caicodepro&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ "net":
/*!**********************!*\
  !*** external "net" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("net");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ "punycode":
/*!***************************!*\
  !*** external "punycode" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("punycode");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "tls":
/*!**********************!*\
  !*** external "tls" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("tls");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@supabase","vendor-chunks/whatwg-url","vendor-chunks/dotenv","vendor-chunks/tr46","vendor-chunks/webidl-conversions"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcapture-lead%2Froute&page=%2Fapi%2Fcapture-lead%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcapture-lead%2Froute.ts&appDir=C%3A%5Csites%5Caicodepro%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5Csites%5Caicodepro&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();