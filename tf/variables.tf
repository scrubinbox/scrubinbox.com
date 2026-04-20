variable "cloudflare_account_id" {
  description = "Cloudflare account ID (set via TF_VAR_cloudflare_account_id)"
  type        = string
}

variable "github_owner" {
  description = "GitHub org or user name"
  type        = string
  default     = "scrubinbox"
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
  default     = "scrubinbox.com"
}

variable "github_owner_id" {
  description = "GitHub org/user numeric ID"
  type        = string
}

variable "github_repo_id" {
  description = "GitHub repository numeric ID"
  type        = string
}

variable "google_client_id" {
  description = "Google OAuth client ID for production"
  type        = string
}

variable "google_client_id_staging" {
  description = "Google OAuth client ID for staging"
  type        = string
}
