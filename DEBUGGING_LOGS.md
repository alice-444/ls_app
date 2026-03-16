# Guide de Debugging - Authentification

Après redémarrage des containers, suivez ce flux pour identifier le problème.

---

## **Étape 1 : Essayez de vous connecter**

Ouvrez DevTools (F12) → **Console** → Effacez les logs précédents

1. Allez sur `https://app.learnsup.fr`
2. Cliquez sur "Se connecter"
3. Entrez vos identifiants et connectez-vous

---

## **Étape 2 : Vérifiez les logs du Frontend**

Dans **Console** du navigateur, vous devriez voir des logs `[middleware]`. Cherchez:

```
[middleware] Incoming request: /dashboard
[middleware] Protected route, checking session: /dashboard
[middleware] Checking session for /dashboard
[middleware] Cookie header: [X cookies]
[middleware] Cookies detected: [...]
[middleware] Calling https://api.learnsup.fr/api/auth/session
[middleware] Backend response status: 200
[middleware] Backend response: { authenticated: true/false, ... }
[middleware] Session valid: true/false
```

### **Que chercher ?**

❌ **Si vous voyez :** `Cookies detected: []`  
→ **Problème :** Les cookies ne sont pas transmis au middleware  
→ **Cause probable :** Cookie n'a pas été créé lors de la connexion, ou Traefik ne le forward pas

❌ **Si vous voyez :** `Cookie header: NONE`  
→ **Problème :** Les cookies ne sont pas disponibles côté serveur Next.js  
→ **Cause probable :** Traefik ne forward pas les Set-Cookie headers

❌ **Si vous voyez :** `Backend response: { authenticated: false }`  
→ **Problème :** Le backend ne peut pas lire la session  
→ **Cause probable :** Cookie malformé ou better-auth ne le reconnaît pas

✅ **Si vous voyez :** `Backend response: { authenticated: true, user: {...} }`  
→ **Succès !** Les cookies sont correctement lus

---

## **Étape 3 : Vérifiez les logs du Backend**

Affichage des logs du backend (en production, utilisez Docker logs) :

```bash
cd /Users/remimoul/Developer/ls_app/infra/docker
docker-compose -f docker-compose-prod.yml logs backend -f
```

Vous devriez voir :

```
[/api/auth/session] Incoming request
[/api/auth/session] Cookie header: [X cookies]
[/api/auth/session] Full cookie: __Secure-better-auth.session_token=...
[/api/auth/session] Session result: { user: { id, email, ... }, session: { ... } }
[/api/auth/session] User found: user@example.com
```

### **Que chercher ?**

❌ **Si vous voyez :** `[/api/auth/session] Cookie header: NONE`  
→ **Problème :** Les cookies ne sont pas reçus du client par Traefik  
→ **Cause probable :** Configuration Traefik ne forward pas les headers Cookie

❌ **Si vous voyez :** `[/api/auth/session] Full cookie: [non-empty] ` mais `Session result: null`  
→ **Problème :** Le cookie est reçu mais better-auth ne le reconnaît pas  
→ **Cause probable :** Cookie domain/name mismatch, ou cookie corrompu par Traefik

✅ **Si vous voyez :** `User found: user@example.com`  
→ **Succès !** better-auth lit correctement le cookie

---

## **Étape 4 : Vérifiez les cookies du navigateur**

DevTools → **Application** → **Cookies** (ou **Storage** dans Firefox)

Cherchez un cookie nommé : `__Secure-better-auth.session_token`

### **Que chercher ?**

✅ **Cookie présent :**

- Domain: `.learnsup.fr`
- Path: `/`
- HttpOnly: ✓
- Secure: ✓
- SameSite: `None`

❌ **Cookie absent :**  
→ Pas créé lors de la connexion  
→ Traefik le supprime dans la réponse

❌ **Cookie avec domain incorrect (ex: `api.learnsup.fr` au lieu de `.learnsup.fr`) :**  
→ Le cookie ne sera pas envoyé aux requêtes vers `app.learnsup.fr`

---

## **Résumé des flux possibles**

### **Flux 1 : Cookie ne se crée pas à la connexion**

```
Sign-in → Backend ne crée pas de cookie
Cause: Erreur dans better-auth lors du sign-in
→ Cherchez les logs lors du POST /api/auth/sign-in/email
```

### **Flux 2 : Cookie créé mais pas envoyé au navigateur**

```
Backend créé cookie → Traefik supprime Set-Cookie
Cause: Middleware Traefik ne forward pas les Set-Cookie headers
→ Vérifiez configuration docker-compose-prod.yml
```

### **Flux 3 : Cookie stocké mais pas retransmis**

```
Cookie dans navigateur → Middleware/middleware ne le voit pas
Cause 1: Cookie domain mismatch (api.learnsup.fr vs app.learnsup.fr)
Cause 2: Traefik ne forward pas les Cookie headers
→ Vérifiez DevTools → Network → Cookie column
```

### **Flux 4 : Cookie reçu mais better-auth ne le lit pas**

```
Cookie envoyé → Backend reçoit → better-auth retourne null
Cause: Cookie name mismatch, ou format incorrect
→ Comparez le nom reçu avec le nom attendu
```

---

## **D'autres infos utiles**

Dans DevTools → **Network**, cherchez la requête vers `/dashboard`:

**Request Headers:**

```
Cookie: __Secure-better-auth.session_token=...
```

**Response Headers:**

```
Set-Cookie: __Secure-better-auth.session_token=...; Path=/; Domain=.learnsup.fr; HttpOnly; Secure; SameSite=None
```

---

## **Commandes de debug**

Vérifier le header CORS réel reçu :

```bash
curl -v https://api.learnsup.fr/api/auth/session
```

Voir tous les logs des containers :

```bash
docker-compose -f docker-compose-prod.yml logs -f
```

Exécuter un shell dans le backend :

```bash
docker-compose -f docker-compose-prod.yml exec backend bash
```
