$server = Start-Process -FilePath "npm.cmd" -ArgumentList "run", "dev:server" -PassThru -NoNewWindow
try { npm run dev:client } finally { Stop-Process -Id $server.Id -ErrorAction SilentlyContinue }
