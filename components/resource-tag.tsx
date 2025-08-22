import { Badge } from "@/components/ui/badge"

interface ResourceTagProps {
  tag: string
  index: number
}

// Accessible color combinations for tags with good contrast
const tagColors = [
  "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200",
  "bg-green-100 text-green-800 hover:bg-green-200 border-green-200",
  "bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200",
  "bg-pink-100 text-pink-800 hover:bg-pink-200 border-pink-200",
  "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200",
  "bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-indigo-200",
  "bg-teal-100 text-teal-800 hover:bg-teal-200 border-teal-200",
  "bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200",
]

const darkTagColors = [
  "dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 dark:border-blue-800",
  "dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50 dark:border-green-800",
  "dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50 dark:border-purple-800",
  "dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-900/50 dark:border-pink-800",
  "dark:bg-yellow-900/30 dark:text-yellow-300 dark:hover:bg-yellow-900/50 dark:border-yellow-800",
  "dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 dark:border-indigo-800",
  "dark:bg-teal-900/30 dark:text-teal-300 dark:hover:bg-teal-900/50 dark:border-teal-800",
  "dark:bg-orange-900/30 dark:text-orange-300 dark:hover:bg-orange-900/50 dark:border-orange-800",
]

export function ResourceTag({ tag, index }: ResourceTagProps) {
  const colorIndex = index % tagColors.length
  const lightColors = tagColors[colorIndex]
  const darkColors = darkTagColors[colorIndex]

  return (
    <Badge
      variant="outline"
      className={`text-xs font-medium transition-colors cursor-default ${lightColors} ${darkColors}`}
    >
      {tag}
    </Badge>
  )
}
