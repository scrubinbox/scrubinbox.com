output "landing_url" {
  description = "Landing page Pages.dev URL"
  value       = "https://${cloudflare_pages_project.landing.name}.pages.dev"
}

output "app_url" {
  description = "App Pages.dev URL"
  value       = "https://${cloudflare_pages_project.app.name}.pages.dev"
}

output "nameservers" {
  description = "Cloudflare nameservers to configure in Namecheap"
  value       = cloudflare_zone.scrubinbox.name_servers
}
