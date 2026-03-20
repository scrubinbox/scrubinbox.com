terraform {
  backend "s3" {
    bucket = "scrubinbox-tfstate"
    key    = "terraform.tfstate"
    region = "auto"

    # R2 endpoint — set via -backend-config="endpoints={s3=\"https://<ACCOUNT_ID>.r2.cloudflarestorage.com\"}"

    # Required for R2 compatibility
    skip_credentials_validation = true
    skip_requesting_account_id  = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    use_path_style              = true
  }
}
