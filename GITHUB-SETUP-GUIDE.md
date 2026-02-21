# 🚀 Guía de Implementación Completa - CRUD App en AKS con GitHub Actions

## 📋 Prerequisitos

- ✅ Cuenta de Azure activa
- ✅ Cuenta de GitHub (gratis en github.com)
- ✅ Azure CLI instalado en tu máquina
- ✅ Git instalado

## 🏗️ Paso 1: Crear Repositorio en GitHub..

### 1.1 Crear Repositorio

1. **Ve a**: https://github.com
2. **Click**: "New repository" (botón verde)
3. **Configuración**:
   - **Repository name**: `aks-crud-app`
   - **Description**: `CRUD Application deployed on Azure Kubernetes Service`
   - **Visibility**: Public o Private (tu elección)
   - **Initialize**: ❌ No marques ninguna opción (ya tienes archivos)
4. **Click**: "Create repository"

### 1.2 Subir Código al Repositorio

```bash
# En tu directorio aks-crud-app
cd aks-crud-app

# Inicializar git (si no está inicializado)
git init

# Agregar remote de GitHub
git remote add origin https://github.com/TU-USUARIO/aks-crud-app.git

# Agregar todos los archivos
git add .

# Hacer commit inicial
git commit -m "Initial commit: CRUD app with AKS infrastructure and GitHub Actions"

# Subir a GitHub
git branch -M main
git push -u origin main
```

## 🔐 Paso 2: Configurar Service Principal de Azure

### 2.1 Crear Service Principal

```bash
# Obtener tu Subscription ID
az account show --query id --output tsv

# Crear Service Principal (reemplaza YOUR_SUBSCRIPTION_ID)
az ad sp create-for-rbac \
  --name "github-actions-aks-crud" \
  --role contributor \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID \
  --sdk-auth
```

### 2.2 Agregar permisos adicionales al Service Principal

**⚠️ CRÍTICO**: El Service Principal necesita permisos adicionales para crear role assignments.

```bash
# Obtener información del Service Principal
SUBSCRIPTION_ID=$(az account show --query id --output tsv)
echo "Subscription ID: $SUBSCRIPTION_ID"

# Listar Service Principals creados
az ad sp list --display-name "github-actions-aks-crud" --query "[].{DisplayName:displayName, AppId:appId}" --output table

# Usar el AppId (clientId) del JSON del paso anterior
CLIENT_ID="TU_CLIENT_ID_AQUI"  # Reemplaza con el clientId de tu AZURE_CREDENTIALS

# Agregar rol de User Access Administrator
az role assignment create \
  --assignee $CLIENT_ID \
  --role "User Access Administrator" \
  --scope /subscriptions/$SUBSCRIPTION_ID

# Verificar que tiene ambos roles
az role assignment list --assignee $CLIENT_ID --output table
```

**Deberías ver dos roles**:
- ✅ Contributor
- ✅ User Access Administrator

**Sin estos permisos, el deployment de Terraform fallará al crear role assignments.**

### 2.2 Copiar la Salida JSON

**Guarda la salida completa**, se ve así:

```json
{
  "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "subscriptionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

## 🔑 Paso 3: Configurar Secretos en GitHub

### 3.1 Agregar Secretos del Repositorio

1. **Ve a tu repositorio** en GitHub
2. **Click**: Settings (pestaña)
3. **Click**: Secrets and variables → Actions
4. **Click**: "New repository secret"

### 3.2 Secretos Requeridos

**Agrega estos secretos uno por uno:**

#### **Secreto 1: AZURE_CREDENTIALS**
- **Name**: `AZURE_CREDENTIALS`
- **Value**: Pega todo el JSON del Service Principal (del paso 2.2)

#### **Secreto 2: ACR_LOGIN_SERVER**
- **Name**: `ACR_LOGIN_SERVER`
- **Value**: `(dejar vacío por ahora, se llenará después)`

#### **Secreto 3: ACR_NAME**
- **Name**: `ACR_NAME`
- **Value**: `(dejar vacío por ahora, se llenará después)`

#### **Secreto 4: POSTGRES_FQDN**
- **Name**: `POSTGRES_FQDN`
- **Value**: `(dejar vacío por ahora, se llenará después)`

#### **Secreto 5: DB_ADMIN_USERNAME**
- **Name**: `DB_ADMIN_USERNAME`
- **Value**: `dbadmin`

#### **Secreto 6: DB_ADMIN_PASSWORD**
- **Name**: `DB_ADMIN_PASSWORD`
- **Value**: `P@ssw0rd123!`

#### **Secreto 7: DB_NAME**
- **Name**: `DB_NAME`
- **Value**: `crudapp`

## 🏗️ Paso 4: Ejecutar Pipeline de Infraestructura

### 4.1 Ejecutar Workflow

1. **Ve a tu repositorio** en GitHub
2. **Click**: Actions (pestaña)
3. **Selecciona**: "Infrastructure Deployment" (en la lista de workflows)
4. **Click**: "Run workflow" (botón azul)
5. **Click**: "Run workflow" (confirmar)

### 4.2 Monitorear Ejecución

1. **Click en el workflow** que se está ejecutando
2. **Verás el progreso** en tiempo real
3. **Duración esperada**: 15-20 minutos

### 4.3 Obtener Outputs de Terraform

**Cuando termine exitosamente**:

1. **Click en el job** "Terraform Apply"
2. **Busca la sección** "Save Outputs to Summary"
3. **Copia los valores**:
   - ACR Login Server
   - PostgreSQL FQDN
   - Cluster Name

### 4.4 Actualizar Secretos con Outputs

1. **Ve a**: Settings → Secrets and variables → Actions
2. **Actualiza estos secretos**:
   - **ACR_LOGIN_SERVER**: `valor del output`
   - **ACR_NAME**: `solo el nombre del ACR (sin .azurecr.io)`
   - **POSTGRES_FQDN**: `valor del output`

## ☸️ Paso 5: Configurar kubectl (Opcional)

```bash
# Obtener credenciales del cluster
az aks get-credentials --resource-group rg-aks-crud-app --name aks-crud-cluster

# Verificar conexión
kubectl get nodes
```

## 🚀 Paso 6: Ejecutar Pipeline de Aplicación

### 6.1 Ejecutar Workflow

1. **Ve a**: Actions → "Deploy Application"
2. **Click**: "Run workflow"
3. **Click**: "Run workflow" (confirmar)

### 6.2 Monitorear Despliegue

1. **Duración esperada**: 10-15 minutos
2. **Verás el progreso** de build y deploy
3. **Al final** obtendrás la información de servicios

## 🌐 Paso 7: Acceder a la Aplicación

### 7.1 Obtener IP Externa

```bash
# Obtener IP del Load Balancer
kubectl get service frontend-service -n crud-app

# Esperar hasta que aparezca EXTERNAL-IP (puede tomar 5-10 minutos)
kubectl get service frontend-service -n crud-app -w
```

### 7.2 Acceder a la Aplicación

- **Frontend**: `http://<EXTERNAL-IP>`
- **Backend API**: `http://<EXTERNAL-IP>/api`
- **Swagger UI**: `http://<EXTERNAL-IP>/api/swagger-ui.html`

## 🗑️ Paso 8: Destruir Infraestructura (Opcional)

### 8.1 Ejecutar Workflow de Destrucción

1. **Ve a**: Actions → "Destroy Infrastructure"
2. **Click**: "Run workflow"
3. **Configurar parámetros**:
   - **confirm_destroy**: Escribe exactamente `DESTROY`
   - **destroy_method**: Selecciona `both`
4. **Click**: "Run workflow"

## 🔄 Flujo de Desarrollo

### Para hacer cambios:

1. **Modifica código** en tu máquina local
2. **Commit y push**:
   ```bash
   git add .
   git commit -m "feat: nueva funcionalidad"
   git push origin main
   ```
3. **GitHub Actions se ejecuta automáticamente**
4. **Verifica deployment** en AKS

## 📊 Monitoreo y Logs

### Ver estado de la aplicación
```bash
# Estado general
kubectl get all -n crud-app

# Logs del backend
kubectl logs -f deployment/backend-deployment -n crud-app

# Logs del frontend
kubectl logs -f deployment/frontend-deployment -n crud-app
```

### Escalar la aplicación
```bash
# Escalar backend
kubectl scale deployment backend-deployment --replicas=3 -n crud-app

# Escalar frontend
kubectl scale deployment frontend-deployment --replicas=3 -n crud-app
```

## 🚨 Solución de Problemas

### Error: "maven:3.9.4-openjdk-17: not found"

**Causa**: Las imágenes específicas de Maven con OpenJDK también han sido deprecadas.

**Solución**: Ya corregido en el código. El Dockerfile ahora usa:
- ✅ **Build stage**: `maven:3.9-eclipse-temurin-17-alpine`
- ✅ **Runtime stage**: `eclipse-temurin:17-jre-alpine`

**Ventajas de las nuevas imágenes**:
- Mantenidas activamente por Eclipse Foundation
- Más pequeñas (Alpine Linux)
- Más seguras y estables
- Compatible con todas las versiones de Maven 3.9.x

### Error: "openjdk:17-jdk-slim: not found"

**Causa**: Oracle cambió la distribución de imágenes OpenJDK en Docker Hub.

**Solución**: Ya corregido en el código. El Dockerfile ahora usa `eclipse-temurin:17-jre-alpine` que es:
- ✅ Mantenido activamente por Eclipse Foundation
- ✅ Más pequeño (Alpine Linux)
- ✅ Más seguro (JRE en lugar de JDK completo)
- ✅ Compatible con OpenJDK 17

### Error: "AuthorizationFailed" - Role Assignment

**Causa**: El Service Principal no tiene permisos para crear role assignments.

**Solución Inmediata**: El role assignment se ha comentado temporalmente en Terraform. Después del deployment exitoso, ejecuta manualmente:

```bash
# El comando exacto aparecerá en el summary del workflow
# Ejemplo:
az role assignment create \
  --assignee <kubelet-identity-object-id> \
  --role AcrPull \
  --scope <acr-resource-id>
```

**Solución Permanente**: Dar permisos adicionales al Service Principal:

```bash
# Obtener el clientId del secreto AZURE_CREDENTIALS
# Agregar rol de User Access Administrator
az role assignment create \
  --assignee <CLIENT_ID> \
  --role "User Access Administrator" \
  --scope /subscriptions/<SUBSCRIPTION_ID>
```

### Error: "alpha numeric characters only are allowed in name"

**Causa**: Azure Container Registry no permite guiones en el nombre.

**Solución**: Ya corregido en el código. El ACR ahora usa:
```hcl
name = "${replace(var.cluster_name, "-", "")}acr${random_string.suffix.result}"
```

### Error: "Output refers to sensitive values"

**Causa**: Terraform requiere marcar outputs sensibles explícitamente.

**Solución**: Ya corregido. Los outputs sensibles ahora tienen `sensitive = true`.

### Error: "Authenticating using the Azure CLI is only supported as a User"

**Causa**: Terraform está intentando usar Azure CLI en lugar del Service Principal.

**Solución**: Este error ya está solucionado en los workflows actualizados. Los workflows ahora configuran las variables de entorno ARM_* correctamente para usar Service Principal.

**Si aún ves este error**:

1. **Verifica que AZURE_CREDENTIALS esté configurado correctamente**:
   - Debe ser el JSON completo del Service Principal
   - Debe incluir: clientId, clientSecret, subscriptionId, tenantId

2. **Verifica el formato del secreto**:
```json
{
  "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "subscriptionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

### Error: "Terraform exited with code 3" (Formato)

**Causa**: Los archivos de Terraform no están correctamente formateados.

**Solución**:

```bash
# En tu directorio local, formatear archivos de Terraform
cd aks-crud-app/infrastructure
terraform fmt

# Verificar que estén correctamente formateados
terraform fmt -check

# Hacer commit de los cambios
git add .
git commit -m "fix: format Terraform files"
git push origin main
```

### Error: Workflow falla en "Azure Login"
```bash
# Verificar que AZURE_CREDENTIALS está configurado correctamente
# Debe ser el JSON completo del Service Principal
```

### Error: "ACR not found"
```bash
# Verificar que ACR_LOGIN_SERVER y ACR_NAME están configurados
# Ejecutar primero el workflow de infraestructura
```

### Error: "Cannot connect to AKS"
```bash
# Verificar que el cluster existe
az aks list --output table

# Obtener credenciales nuevamente
az aks get-credentials --resource-group rg-aks-crud-app --name aks-crud-cluster
```

### Error: Pods no inician
```bash
# Ver logs de pods
kubectl logs -f deployment/backend-deployment -n crud-app
kubectl describe pod <pod-name> -n crud-app
```

## 💰 Gestión de Costos

### Costos estimados mensuales:
- **AKS**: ~$60-80 USD
- **PostgreSQL**: ~$20-30 USD
- **Load Balancer**: ~$20 USD
- **ACR**: ~$5 USD
- **Total**: ~$105-135 USD/mes

### Para minimizar costos:
- **Usa el workflow de destroy** cuando no uses la aplicación
- **Escala a 1 replica** en desarrollo
- **Usa VM sizes más pequeñas** (Standard_B1s)

## ✅ Checklist de Implementación

### Configuración inicial:
- [ ] Repositorio GitHub creado
- [ ] Código subido a GitHub
- [ ] Service Principal creado en Azure
- [ ] Secretos configurados en GitHub

### Infraestructura:
- [ ] Workflow "Infrastructure Deployment" ejecutado exitosamente
- [ ] Outputs de Terraform obtenidos
- [ ] Secretos actualizados con outputs (ACR_LOGIN_SERVER, POSTGRES_FQDN, ACR_NAME)

### Aplicación:
- [ ] Workflow "Deploy Application" ejecutado exitosamente
- [ ] Aplicación accesible desde internet
- [ ] kubectl configurado localmente (opcional)

### Verificación final:
- [ ] Frontend accesible: `http://<EXTERNAL-IP>`
- [ ] Backend API funcional: `http://<EXTERNAL-IP>/api`
- [ ] Swagger UI disponible: `http://<EXTERNAL-IP>/api/swagger-ui.html`

## 🎯 Ventajas de GitHub Actions vs Azure DevOps

### ✅ **Ventajas**:
- **Sin límites de parallelism** para repositorios públicos
- **Límites generosos** para repositorios privados (2000 minutos/mes gratis)
- **No requiere extensiones** adicionales
- **Interfaz más simple** y moderna
- **Mejor integración** con el código
- **Workflows más legibles** y mantenibles

### 🚀 **Funcionalidades**:
- **Triggers automáticos** en push/PR
- **Ejecución manual** con parámetros
- **Environments** para aprobaciones
- **Artifacts** para compartir archivos entre jobs
- **Matrix builds** para múltiples configuraciones
- **Secretos seguros** a nivel de repositorio/organización

¡Listo! Tu aplicación CRUD ahora usa GitHub Actions y debería ser mucho más confiable. 🎉