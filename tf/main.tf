# --- Zone ---

resource "cloudflare_zone" "scrubinbox" {
  account = {
    id = var.cloudflare_account_id
  }
  name = "scrubinbox.com"
  type = "full"
}

# --- Pages Projects ---

resource "cloudflare_pages_project" "landing" {
  account_id        = var.cloudflare_account_id
  name              = "scrubinbox-landing"
  production_branch = "main"
  build_config = {
    destination_dir = "landing"
  }
  source = {
    type = "github"
    config = {
      owner                         = var.github_owner
      repo_name                     = var.github_repo
      owner_id                      = var.github_owner_id
      repo_id                       = var.github_repo_id
      production_branch             = "main"
      production_deployments_enabled = true
      preview_deployment_setting    = "none"
    }
  }
}

resource "cloudflare_pages_project" "app" {
  account_id        = var.cloudflare_account_id
  name              = "scrubinbox-app"
  production_branch = "main"
  build_config = {
    build_command   = "npm run build"
    destination_dir = "dist"
    root_dir        = "/"
  }
  deployment_configs = {
    production = {
      fail_open = true
      env_vars = {
        VITE_GOOGLE_CLIENT_ID = {
          type  = "plain_text"
          value = var.google_client_id
        }
      }
    }
    preview = {
      fail_open = true
    }
  }
  source = {
    type = "github"
    config = {
      owner                         = var.github_owner
      repo_name                     = var.github_repo
      owner_id                      = var.github_owner_id
      repo_id                       = var.github_repo_id
      production_branch             = "main"
      production_deployments_enabled = true
      preview_deployment_setting    = "none"
    }
  }
}

resource "cloudflare_pages_project" "app_staging" {
  account_id        = var.cloudflare_account_id
  name              = "scrubinbox-app-staging"
  production_branch = "staging"
  build_config = {
    build_command   = "npm run build"
    destination_dir = "dist"
    root_dir        = "/"
  }
  deployment_configs = {
    production = {
      fail_open = true
      env_vars = {
        VITE_GOOGLE_CLIENT_ID = {
          type  = "plain_text"
          value = var.google_client_id_staging
        }
      }
    }
    preview = {
      fail_open = true
    }
  }
  source = {
    type = "github"
    config = {
      owner                         = var.github_owner
      repo_name                     = var.github_repo
      owner_id                      = var.github_owner_id
      repo_id                       = var.github_repo_id
      production_branch             = "staging"
      production_deployments_enabled = true
      preview_deployment_setting    = "none"
    }
  }
}

# --- Custom Domains ---

resource "cloudflare_pages_domain" "landing_domain" {
  account_id   = var.cloudflare_account_id
  project_name = cloudflare_pages_project.landing.name
  name         = "scrubinbox.com"
}

resource "cloudflare_pages_domain" "app_domain" {
  account_id   = var.cloudflare_account_id
  project_name = cloudflare_pages_project.app.name
  name         = "app.scrubinbox.com"
}

resource "cloudflare_pages_domain" "app_staging_domain" {
  account_id   = var.cloudflare_account_id
  project_name = cloudflare_pages_project.app_staging.name
  name         = "staging.scrubinbox.com"
}

# --- DNS Records ---

resource "cloudflare_dns_record" "landing_cname" {
  zone_id = cloudflare_zone.scrubinbox.id
  name    = "@"
  type    = "CNAME"
  content = "scrubinbox-landing.pages.dev"
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "app_cname" {
  zone_id = cloudflare_zone.scrubinbox.id
  name    = "app"
  type    = "CNAME"
  content = "scrubinbox-app.pages.dev"
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "app_staging_cname" {
  zone_id = cloudflare_zone.scrubinbox.id
  name    = "staging"
  type    = "CNAME"
  content = "scrubinbox-app-staging.pages.dev"
  proxied = true
  ttl     = 1
}
