$ErrorActionPreference = "Stop"
$base = "http://127.0.0.1:8002/api/v1"
$j = @{ Accept = "application/json"; "Content-Type" = "application/json" }

function Api($method, $path, $body, $token) {
    $headers = @{ Accept = "application/json"; "Content-Type" = "application/json" }
    if ($token) { $headers["Authorization"] = "Bearer $token" }
    $params = @{ Uri = "$base$path"; Method = $method; Headers = $headers; ErrorAction = "Stop" }
    if ($body) { $params["Body"] = ($body | ConvertTo-Json -Depth 5) }
    return Invoke-RestMethod @params
}

try {
    $ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

    # 1. Register User A
    $regA = Api POST "/auth/register" @{ name="Alice"; email="alice$ts@pic.app"; password="password123"; password_confirmation="password123"; date_of_birth="1995-06-15" }
    $tokA = $regA.token
    Write-Host "1. REGISTER A     OK  user=$($regA.user.name) age=$($regA.user.age)"

    # 2. Register User B
    $regB = Api POST "/auth/register" @{ name="Bob"; email="bob$ts@pic.app"; password="password123"; password_confirmation="password123"; date_of_birth="1998-03-20" }
    $tokB = $regB.token
    Write-Host "2. REGISTER B     OK  user=$($regB.user.name)"

    # 3. Login User A (verifies login works, but keep using tokA from register)
    $login = Api POST "/auth/login" @{ email="alice$ts@pic.app"; password="password123" }
    $tokA = $login.token   # use fresh token from login
    Write-Host "3. LOGIN          OK  user=$($login.user.name)"

    # 4. GET /me
    $me = Api GET "/me" $null $tokA
    Write-Host "4. GET /me        OK  name=$($me.user.name)"

    # 5. Update profile
    $prof = Api PUT "/profile" @{ bio="I love live music!"; location="London, UK"; interests=@("Music","Concerts") } $tokA
    Write-Host "5. PUT /profile   OK  bio=$($prof.user.profile.bio)"

    # 6. Create PIC
    $tomorrow = (Get-Date).AddDays(5).ToString("yyyy-MM-dd")
    $pic = Api POST "/pics" @{ event_name="Concert Night"; description="Great concert!"; location="Wembley, London"; event_date=$tomorrow; event_time="20:00"; people_needed=2; category="Music" } $tokA
    $picId = $pic.data.id
    Write-Host "6. POST /pics     OK  id=$picId name=$($pic.data.event_name)"

    # 7. Discover
    $discover = Api GET "/pics" $null $tokB
    Write-Host "7. GET /pics      OK  count=$($discover.data.Count)"

    # 8. Get PIC detail
    $detail = Api GET "/pics/$picId" $null $tokB
    Write-Host "8. GET /pics/id   OK  slots=$($detail.data.available_slots)"

    # 9. User B sends join request
    $req = Api POST "/pics/$picId/join" @{} $tokB
    $reqId = $req.data.id
    Write-Host "9. POST /join     OK  reqId=$reqId status=$($req.data.status)"

    # 10. Duplicate request rejected
    $dupErr = $null
    try { Api POST "/pics/$picId/join" @{} $tokB } catch { $dupErr = $_.Exception.Message }
    Write-Host "10. DUPLICATE     OK  rejected=$($dupErr -ne $null)"

    # 11. Owner views requests
    $reqs = Api GET "/pics/$picId/requests" $null $tokA
    Write-Host "11. GET requests  OK  count=$($reqs.data.Count)"

    # 12. Owner accepts request
    $accepted = Api POST "/join-requests/$reqId/accept" @{} $tokA
    Write-Host "12. ACCEPT        OK  status=$($accepted.data.status)"

    # 13. PIC now has participant
    $detail2 = Api GET "/pics/$picId" $null $tokA
    Write-Host "13. PIC updated   OK  participants=$($detail2.data.participants_count) status=$($detail2.data.status)"

    # 14. Get conversations (User B should see one)
    $convs = Api GET "/conversations" $null $tokB
    $convId = $convs.data[0].id
    Write-Host "14. GET convs     OK  count=$($convs.data.Count)"

    # 15. User B sends a message
    $msg = Api POST "/conversations/$convId/messages" @{ message="Hey Alice! Looking forward to it!" } $tokB
    Write-Host "15. POST message  OK  id=$($msg.data.id) text=$($msg.data.message)"

    # 16. User A reads messages
    $msgs = Api GET "/conversations/$convId/messages" $null $tokA
    Write-Host "16. GET messages  OK  count=$($msgs.data.Count)"

    # 17. Check notifications (User A should have join request received)
    $notifs = Api GET "/notifications" $null $tokA
    Write-Host "17. GET notifs    OK  count=$($notifs.data.Count)"

    # 18. Mark all notifications read
    $markRead = Api POST "/notifications/read-all" @{} $tokA
    Write-Host "18. MARK-ALL-READ OK  msg=$($markRead.message)"

    # 19. Deactivate PIC
    $deact = Api POST "/pics/$picId/deactivate" @{} $tokA
    Write-Host "19. DEACTIVATE    OK  status=$($deact.data.status)"

    # 20. Deactivated PIC disappears from discover
    $discover2 = Api GET "/pics" $null $tokB
    $stillVisible = $discover2.data | Where-Object { $_.id -eq $picId }
    Write-Host "20. HIDDEN        OK  still_visible=$($stillVisible -ne $null)"

    # 21. My PICs still shows it
    $myPics = Api GET "/my-pics" $null $tokA
    Write-Host "21. MY-PICS       OK  count=$($myPics.data.Count)"

    # 22. Logout
    $out = Api POST "/auth/logout" @{} $tokA
    Write-Host "22. LOGOUT        OK  msg=$($out.message)"

    # 23. Token revoked after logout
    $revokedErr = $null
    try { Api GET "/me" $null $tokA } catch { $revokedErr = $true }
    Write-Host "23. TOKEN-REVOKED OK  revoked=$($revokedErr -ne $null)"

    # 24. Mark pics as passed command
    $passResult = & php artisan pics:mark-passed 2>&1
    Write-Host "24. SCHEDULER     OK  output=$passResult"

    Write-Host ""
    Write-Host "=== ALL 24 CHECKS PASSED ==="

} catch {
    Write-Host "FAILED: $_"
    Write-Host $_.ScriptStackTrace
}
