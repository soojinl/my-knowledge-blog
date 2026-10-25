import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { componentRegistry } from "./quartz/components/registry"

// Explorer category order. The function is serialized and runs in the browser,
// so the order list must live inside the function body.
componentRegistry.setOptionOverrides("@quartz-community/explorer", {
  sortFn: (a: any, b: any) => {
    const order = ["ai-news", "ai-projects", "crm-growth", "data"]
    const ia = order.indexOf((a.slugSegment || "").toLowerCase())
    const ib = order.indexOf((b.slugSegment || "").toLowerCase())
    if (ia !== -1 || ib !== -1) {
      return (ia === -1 ? order.length : ia) - (ib === -1 ? order.length : ib)
    }
    if (a.isFolder === b.isFolder) {
      return a.displayName.localeCompare(b.displayName, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    }
    return a.isFolder ? -1 : 1
  },
})

const config = await loadQuartzConfig()
export default config
export const layout = await loadQuartzLayout()
