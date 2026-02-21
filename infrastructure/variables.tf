# Resource Group
variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
  default     = "rg-aks-crud-app"
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "East US 2"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "development"
}

# AKS Cluster
variable "cluster_name" {
  description = "Name of the AKS cluster"
  type        = string
  default     = "aks-crud-cluster"
}

variable "node_count" {
  description = "Number of nodes in the AKS cluster"
  type        = number
  default     = 2
}

variable "node_vm_size" {
  description = "VM size for AKS nodes"
  type        = string
  default     = "Standard_B2s"
}

# Database
variable "db_admin_username" {
  description = "PostgreSQL admin username"
  type        = string
  default     = "dbadmin"
}

variable "db_admin_password" {
  description = "PostgreSQL admin password"
  type        = string
  sensitive   = true
  default     = "P@ssw0rd123!"
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "crudapp"
}