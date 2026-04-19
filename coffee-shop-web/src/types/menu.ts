export interface MenuItem {
  label: string
  href: string
  match?: 'exact' | 'prefix'
}
