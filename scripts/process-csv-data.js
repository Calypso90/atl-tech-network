// Script to fetch and process the Atlanta networking CSV data
const csvUrl =
  "https://docs.google.com/spreadsheets/d/1MQN7xN8ZNxPiV2ZOURA_qWEQ9E589GdURK4epvvQhfE/export?format=csv&gid=0"

async function processCsvData() {
  try {
    console.log("Fetching CSV data...")
    const response = await fetch(csvUrl)
    const csvText = await response.text()

    console.log("Raw CSV content:")
    console.log(csvText)

    // Parse CSV manually (simple approach)
    const lines = csvText.split("\n")
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    console.log("\nHeaders:", headers)

    const data = []
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        // Handle CSV parsing with potential commas in quoted fields
        const values = parseCSVLine(lines[i])
        if (values.length >= 3) {
          const entry = {
            meetup: values[0]?.trim().replace(/"/g, "") || "",
            link: values[1]?.trim().replace(/"/g, "") || "",
            notes: values[2]?.trim().replace(/"/g, "") || "",
          }
          data.push(entry)
        }
      }
    }

    console.log("\nParsed data entries:", data.length)
    console.log("\nSample entries:")
    data.slice(0, 5).forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.meetup}`)
      console.log(`   Link: ${entry.link}`)
      console.log(`   Notes: ${entry.notes}`)
      console.log("")
    })

    // Categorize the data
    const categorized = categorizeData(data)
    console.log("\nCategorized data:")
    console.log(`Meetups: ${categorized.meetups.length}`)
    console.log(`Conferences: ${categorized.conferences.length}`)
    console.log(`Online Resources: ${categorized.onlineResources.length}`)
    console.log(`Tech Hubs: ${categorized.techHubs.length}`)

    // Format for sample-data.ts
    const formatted = formatForSampleData(categorized)
    console.log("\n=== FORMATTED DATA FOR SAMPLE-DATA.TS ===")
    console.log(JSON.stringify(formatted, null, 2))

    return formatted
  } catch (error) {
    console.error("Error processing CSV:", error)
  }
}

function parseCSVLine(line) {
  const values = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      values.push(current)
      current = ""
    } else {
      current += char
    }
  }

  values.push(current)
  return values
}

function categorizeData(data) {
  const meetups = []
  const conferences = []
  const onlineResources = []
  const techHubs = []

  data.forEach((entry) => {
    if (!entry.meetup || entry.meetup === "Add new suggestions below") return

    const name = entry.meetup.toLowerCase()
    const notes = entry.notes.toLowerCase()

    // Categorization logic based on keywords
    if (
      name.includes("conference") ||
      name.includes("summit") ||
      name.includes("expo") ||
      notes.includes("conference") ||
      notes.includes("annual event")
    ) {
      conferences.push(entry)
    } else if (
      name.includes("online") ||
      name.includes("virtual") ||
      name.includes("course") ||
      notes.includes("online") ||
      notes.includes("virtual") ||
      notes.includes("course")
    ) {
      onlineResources.push(entry)
    } else if (
      name.includes("hub") ||
      name.includes("space") ||
      name.includes("center") ||
      notes.includes("coworking") ||
      notes.includes("workspace") ||
      notes.includes("incubator")
    ) {
      techHubs.push(entry)
    } else {
      // Default to meetups
      meetups.push(entry)
    }
  })

  return { meetups, conferences, onlineResources, techHubs }
}

function formatForSampleData(categorized) {
  const formatEntry = (entry, type, index) => {
    // Generate tags based on the entry name and notes
    const tags = generateTags(entry.meetup, entry.notes)

    return {
      id: `csv-${index}`,
      type: type,
      name: entry.meetup,
      description:
        entry.notes || `Join ${entry.meetup} for networking and learning opportunities in Atlanta's tech community.`,
      tags: tags,
      link: entry.link,
      image: `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(entry.meetup + " logo")}`,
    }
  }

  return {
    meetups: categorized.meetups.map((entry, i) => formatEntry(entry, "meetup", i)),
    conferences: categorized.conferences.map((entry, i) => formatEntry(entry, "conference", i + 100)),
    onlineResources: categorized.onlineResources.map((entry, i) => formatEntry(entry, "online", i + 200)),
    techHubs: categorized.techHubs.map((entry, i) => formatEntry(entry, "tech-hub", i + 300)),
  }
}

function generateTags(name, notes) {
  const tags = []
  const text = (name + " " + notes).toLowerCase()

  // Technology tags
  if (text.includes("javascript") || text.includes("js")) tags.push("JavaScript")
  if (text.includes("python")) tags.push("Python")
  if (text.includes("react")) tags.push("React")
  if (text.includes("node")) tags.push("Node.js")
  if (text.includes("data science") || text.includes("data")) tags.push("Data Science")
  if (text.includes("ai") || text.includes("artificial intelligence")) tags.push("AI")
  if (text.includes("machine learning") || text.includes("ml")) tags.push("Machine Learning")
  if (text.includes("devops")) tags.push("DevOps")
  if (text.includes("cloud")) tags.push("Cloud")
  if (text.includes("mobile")) tags.push("Mobile")
  if (text.includes("frontend") || text.includes("front-end")) tags.push("Frontend")
  if (text.includes("backend") || text.includes("back-end")) tags.push("Backend")
  if (text.includes("fullstack") || text.includes("full-stack")) tags.push("Full-Stack")

  // Community tags
  if (text.includes("women") || text.includes("diversity")) tags.push("Diversity")
  if (text.includes("startup")) tags.push("Startups")
  if (text.includes("entrepreneur")) tags.push("Entrepreneurship")
  if (text.includes("networking")) tags.push("Networking")
  if (text.includes("career")) tags.push("Career Development")
  if (text.includes("mentorship") || text.includes("mentor")) tags.push("Mentorship")

  // Default tags if none found
  if (tags.length === 0) {
    tags.push("Tech Community", "Atlanta")
  }

  return tags.slice(0, 4) // Limit to 4 tags
}

// Run the processing
processCsvData()
