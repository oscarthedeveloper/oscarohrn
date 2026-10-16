# Oscar Öhrn — installation

Webbplatsen består av index.html, app.js, config.js, scroll.js, vendor/ och admin/index.html. Ingen byggprocess behövs. Lägg filerna på en webbserver som stödjer index.html i mappar. /admin kan omdirigeras till /admin/; båda aktiverar redigeringsläget. HTML-filerna är identiska och delar app.js.

## Supabase

1. Skapa ett Supabase-projekt.
2. Kör supabase.sql i projektets SQL Editor.
3. Skapa ditt konto i Authentication → Users. Välj ett starkt lösenord. Stäng av publik registrering i Authentication-inställningarna om ingen annan ska kunna registrera sig.
4. Kopiera kontots användar-ID (UUID). Kör den sista kommenterade INSERT-raden i supabase.sql med ditt UUID. Avkommentera raden först. Endast användare i site_admins kan spara. Konton kan inte lägga till sig själva i den tabellen.
5. Fyll i projektets URL och publika publishable/anon-nyckel i config.js. Använd aldrig secret/service_role-nyckeln i webbplatsen.
6. Ställ in Site URL i Supabase Authentication till https://oscarohrn.com.
7. Öppna /admin, logga in och spara första gången. Då lagras mallens innehåll i databasen.

Ändringar publiceras när du trycker på Spara ändringar. Innehållet hämtas vid sidladdning. Samtidig redigering skyddas genom versionskontroll; om någon annan sparat måste du kopiera dina ändringar och hämta senaste innehållet innan du försöker igen.

## Redigering

Klicka på texter och rubriker direkt på sidan. Lägg till eller ta bort textblock/rubriker där de visas. Projekt har länkfält, Kommande-val och borttagning direkt under projektet. Tom text kan raderas helt; textblock har även en Ta bort-knapp. Markera gult växlar bakgrund på ett helt block. Projekt utan länk visas utan klickbar länk. Externa projektlänkar öppnas i ny flik; navigering inom sidan sker i samma flik.

Utan Supabase-inställningar är /admin ett tydligt märkt demoläge. Demo sparar endast i webbläsarens localStorage och ändrar inte den publika sidan. Demoinnehåll överförs inte automatiskt till Supabase.

## Domän och webbhotell

Ladda upp index.html, app.js, config.js, scroll.js, vendor/ och admin/index.html till webbhotellets publika rot. Koppla oscarohrn.com enligt webbhotellets DNS-anvisningar och aktivera HTTPS. Supabase lagrar innehåll och sköter inloggning; det är inte webbhotellet för HTML-filerna. Supabase-projekt och DNS är ännu inte konfigurerade.

## Lokal förhandsvisning

Kör `python3 -m http.server 8765` i denna mapp. Öppna http://127.0.0.1:8765 och http://127.0.0.1:8765/admin/.

## Säkerhet och verifiering

All redigerad text visas som text, inte som HTML. Länkar tillåter endast http/https. Databasens Row Level Security tillåter offentlig läsning och skrivning endast för registrerade administratörer. Adminlistan är inte offentligt läsbar och kan inte ändras från webbläsaren. Installationens SQL behöver köras innan anslutningen fungerar.

Efter installation: kontrollera sparande med ditt administratörskonto, omladdning av den publika sidan, samt att ett konto utanför site_admins inte kan uppdatera innehållet. Live-inloggning och databasbehörigheter kan inte verifieras innan Supabase-projektet finns.

Supabase-dokumentation: https://supabase.com/docs/guides/database/postgres/row-level-security

## Mjuk skrollning

Lenis 1.3.26 ligger lokalt i vendor/lenis/ (MIT-licens inkluderad) och startas av scroll.js. Ladda upp även scroll.js och hela vendor-mappen. Ankarlänkar och inställningen för minskad rörelse stöds. Ingen byggprocess eller extern CDN behövs för Lenis.
