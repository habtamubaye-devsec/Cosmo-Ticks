import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import './index.css'
import './App.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#6366f1',
          borderRadius: 8,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
        },
        components: {
          Button: {
            borderRadius: 6,
            controlHeight: 40,
            paddingContentHorizontal: 20,
          },
          Card: {
            borderRadius: 12,
            boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          },
          Table: {
            headerBg: '#f9fafb',
            headerColor: '#374151',
            borderRadius: 8,
          },
          Menu: {
            itemBorderRadius: 8,
            itemMarginInline: 8,
          }
        }
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>,
)
