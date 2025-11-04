# Resources Directory

**Purpose**: Project-specific resources and credentials

**⚠️ WARNING**: This directory contains sensitive information. Files here are gitignored and MUST NOT be committed to version control.

---

## 📁 Directory Structure

```
Resources/
├── README.md              # This file
├── CONNECTIONS.md         # Service credentials (NEVER commit!)
└── .backups/              # Credential backups (NEVER commit!)
```

---

## 🔒 Security Notice

### Files in This Directory

**CONNECTIONS.md**
- Contains all service credentials
- API keys, database passwords, tokens, etc.
- **AUTOMATICALLY GITIGNORED**
- **NEVER** commit this file
- **NEVER** share this file

**. backups/**
- Timestamped backups of CONNECTIONS.md
- Created automatically when credentials are updated
- **AUTOMATICALLY GITIGNORED**
- Keep for recovery purposes

---

## 📝 CONNECTIONS.md Format

This file will be auto-generated when you run the initialization scripts.

**Example structure**:

```markdown
# Service Connections

Last Updated: 2025-11-03

---

## Supabase

**Project URL**: https://xxx.supabase.co
**Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
**Service Role Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

---

## Anthropic Claude

**API Key**: sk-ant-...

---

## [Additional Services]

[Service credentials here]
```

---

## 🛠️ How to Use

### Initial Setup

1. **Create CONNECTIONS.md manually** or use initialization script
2. **Add credentials** for each service you use
3. **Keep updated** as services are added/removed

### Updating Credentials

**Option 1: Manual**
```bash
nano Resources/CONNECTIONS.md
```

**Option 2: Using Update Script** (if available)
```bash
node scripts/update-credentials.js
```

### Viewing Credentials

```bash
# View all
cat Resources/CONNECTIONS.md

# Search for specific service
grep -A 5 "Supabase" Resources/CONNECTIONS.md
```

---

## 🔄 Backup & Recovery

### Automatic Backups

Backups are created automatically in `Resources/.backups/` when:
- Credentials are updated
- New services are added
- Using credential management scripts

### Manual Backup

```bash
cp Resources/CONNECTIONS.md Resources/.backups/CONNECTIONS_$(date +%Y%m%d_%H%M%S).md
```

### Recovery

```bash
# List available backups
ls -lt Resources/.backups/

# Restore from backup
cp Resources/.backups/CONNECTIONS_20251103_120000.md Resources/CONNECTIONS.md
```

---

## ⚠️ Important Reminders

### DO:
- ✅ Keep CONNECTIONS.md up to date
- ✅ Back up before major changes
- ✅ Use strong, unique passwords/keys
- ✅ Rotate credentials periodically
- ✅ Document each service clearly

### DON'T:
- ❌ Commit CONNECTIONS.md to git
- ❌ Share credentials in chat/email
- ❌ Use weak or default passwords
- ❌ Reuse credentials across projects
- ❌ Store credentials in code

---

## 🔗 Related Documentation

- **Setup Guide**: `../SETUP.md` - Initial project setup
- **Attack Kit**: `/mnt/c/Development/resources/ATTACK_KIT.md`
- **Credential Management**: `/mnt/c/Development/resources/CREDENTIAL_UPDATE_GUIDE.md`

---

## 🆘 If Credentials Are Compromised

1. **Immediately revoke** compromised credentials
2. **Generate new** credentials for the service
3. **Update** CONNECTIONS.md and .env.local
4. **Rotate** any related credentials
5. **Document** the incident
6. **Review** security practices

---

## 📞 Support

For credential-related issues:
1. Check service documentation first
2. Review Attack Kit security section
3. Consult team lead if needed

---

**Last Updated**: 2025-11-03

**Remember**: Credentials are the keys to the kingdom. Protect them accordingly.
