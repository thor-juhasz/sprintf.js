import { sprintf, vsprintf } from '@/index'

declare global {
    interface Window {
        sprintf: typeof sprintf
        vsprintf: typeof vsprintf
    }
}

window.sprintf = sprintf
window.vsprintf = vsprintf
