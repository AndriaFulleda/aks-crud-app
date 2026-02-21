# aks-crud-app
Ejercicio3
Crear un Pipeline, utilizando GitHub Actions que me permita desplegar una aplicación diseñada con un frontend (react) + backend (java sprint boot) + base de datos (postgres) y se ejecuten en recursos de Azure mediante comandos de Terraform. 

Recursos:

resource group
virtual networks
storage accounts
Kubernetes (AKS)
interface network
public ip
network segurity groups
Solución:

Crear un repositorio en GitHub con el nombre "aks-crud-app" y descargarlo en la maquina local, ejecutando el siguiente comando:
git clone https://github.com/VillaviH/aks-crud-app.git
Debemos conectar GitHub con Azure Cloud para el Pipeline pueda crear nuestra infraestructura, para lo cual debemos ejecutar los siguientes comandos de azure, teniendo en cuenta que el resultado es un yaml y debemos pasarlo como variables de entorno en GitHub.
az account show --query id
az ad sp create-for-rbac --name "github-actions-aks-crud" --role contributor --scopes /subscriptions/YOUR_SUBSCRIPTION_ID --sdk-auth
Ahora debemos agregar permisos adicionales al Service Principal
Obtener información del Service Principal
Linux:
SUBSCRIPTION_ID=$(az account show --query id --output tsv)
echo "Subscription ID: $SUBSCRIPTION_ID"
PowerShell:
$SUBSCRIPTION_ID = az account show --query id --output tsv
Write-Host "Subscription ID: $SUBSCRIPTION_ID"
Listar Service Principals creados
az ad sp list --display-name "github-actions-aks-crud" --query "[].{DisplayName:displayName, AppId:appId}" --output table
Usar el AppId (clientId) del JSON del paso anterior
Linux:
CLIENT_ID="TU_CLIENT_ID_AQUI"  # Reemplaza con el clientId de tu AZURE_CREDENTIALS
PowerShell:
$CLIENT_ID = "0e9221dc-79ec-45f0-97ea-6a844520ddd6"
Agregar rol de User Access Administrator
az role assignment create \
  --assignee $CLIENT_ID \
  --role "User Access Administrator" \
  --scope /subscriptions/$SUBSCRIPTION_ID
Verificar que tiene ambos roles
az role assignment list --assignee $CLIENT_ID --output table
En el repositorio de GitHub debemos crear:
Secreto 1 "repositorio de secretos" llamado "AZURE_CREDENTIALS" con los datos yaml que se obtuvieron del paso anterior, para esto ir a Settings->New repository secret
Secreto 2: ACR_LOGIN_SERVER
Name: ACR_LOGIN_SERVER
Value: (Lo dejamos vacío y lo llenamos luego de la ejecución del primer pipeline)
Secreto 3: ACR_NAME 
Name: ACR_NAME
Value: (Lo dejamos vacío y lo llenamos luego de la ejecución del primer pipeline)
Secreto 4:  POSTGRES_FQDN
Name: POSTGRES_FQDN
Value: (Lo dejamos vacío y lo llenamos luego de la ejecución del primer pipeline)
Secreto 5: DB_ADMIN_USERNAME
Name: DB_ADMIN_USERNAME
Value: dbadmin
Secreto 6: DB_ADMIN_PASSWORD
Name: DB_ADMIN_PASSWORD
Value: P@ssw0rd123!
Secreto 7: DB_NAME
Name: DB_NAME
Value: crudapp
Una vez realizado los pasos anteriores, debemos descargar los siguientes archivos a la carpeta creada anteriormente.
Con la carpeta y archivos listos debemos enviar un cambio en el repositorio, podríamos modificar el archivo README y ejecutar los siguientes comandos para actualizar el repositorio.
git add .
git commit -m "Add Terraform infrastructure and CI/CD pipeline 1"
git push origin main
Con esta actualización se ejecuta el Pipeline llamado "Infrastructure" y luego de un momento debemos revisar el portal de azure y veremos la infraestructura creada, algo así:
.

Luego debemos ejecutar el Pipeline llamado "deploy-app", pero desplegar la aplicación.
Al final debemos destruir todo los recursos creados y así evitar se genere costos innecesarios, para esto debemos ejecutar el Pipeline llamado "destroy-infrastructure", pero debemos ingresar en el label la palabra DESTROY.