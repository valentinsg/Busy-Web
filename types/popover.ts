export type Popover = {
  id: string
  title: string
  body: string | null
  discount_code: string | null
  enabled: boolean
  priority: number
  start_at: string | null
  end_at: string | null
  sections: string[] | null
  paths: string[] | null
  created_at: string
  updated_at: string
}
