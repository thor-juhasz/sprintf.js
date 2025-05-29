import { sprintf, vsprintf } from '@/sprintf'

declare global {
    interface Window {
        sprintf: typeof sprintf
        vsprintf: typeof vsprintf
    }
}

window.sprintf = sprintf
window.vsprintf = vsprintf
