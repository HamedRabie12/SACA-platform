-- PostgreSQL migration generated from the canonical Prisma schema.
-- REVIEW IN STAGING. This migration contains schema only; data migration is separate.
BEGIN;
CREATE TABLE IF NOT EXISTS "USState" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "code" TEXT NOT NULL,
  "nameEn" TEXT NOT NULL,
  "nameAr" TEXT NOT NULL,
  "fipsCode" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_USState_code" ON "USState" ("code");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_USState_nameEn" ON "USState" ("nameEn");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_USState_nameAr" ON "USState" ("nameAr");
CREATE TABLE IF NOT EXISTS "USCity" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "stateId" TEXT NOT NULL,
  "nameEn" TEXT NOT NULL,
  "nameAr" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "sortOrder" INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS "Member" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT,
  "phoneE164" TEXT,
  "name" TEXT NOT NULL,
  "avatarUrl" TEXT,
  "bio" TEXT,
  "stateId" TEXT,
  "cityId" TEXT,
  "profession" TEXT,
  "interests" TEXT,
  "membershipType" TEXT NOT NULL DEFAULT 'Member',
  "accountState" TEXT NOT NULL DEFAULT 'Active',
  "emailVerifiedAt" TIMESTAMPTZ,
  "phoneVerifiedAt" TIMESTAMPTZ,
  "privacyShowState" BOOLEAN NOT NULL DEFAULT TRUE,
  "privacyShowCity" BOOLEAN NOT NULL DEFAULT FALSE,
  "privacyShowPrecise" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_Member_email" ON "Member" ("email");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_Member_phoneE164" ON "Member" ("phoneE164");
CREATE TABLE IF NOT EXISTS "CountryCode" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "isoAlpha2" TEXT NOT NULL,
  "isoAlpha3" TEXT NOT NULL,
  "nameAr" TEXT NOT NULL,
  "nameEn" TEXT NOT NULL,
  "dialingCode" TEXT NOT NULL,
  "flagIdentifier" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "sortOrder" INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_CountryCode_isoAlpha2" ON "CountryCode" ("isoAlpha2");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_CountryCode_isoAlpha3" ON "CountryCode" ("isoAlpha3");
CREATE TABLE IF NOT EXISTS "Organization" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "logoUrl" TEXT,
  "coverUrl" TEXT,
  "stateId" TEXT,
  "cityId" TEXT,
  "address" TEXT,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "phone" TEXT,
  "email" TEXT,
  "website" TEXT,
  "hoursAr" TEXT,
  "services" TEXT,
  "verification" TEXT NOT NULL DEFAULT 'Unverified',
  "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "isDevSeed" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "Event" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "imageUrl" TEXT,
  "eventDate" TIMESTAMPTZ NOT NULL,
  "endDate" TIMESTAMPTZ,
  "isOnline" BOOLEAN NOT NULL DEFAULT FALSE,
  "location" TEXT,
  "stateId" TEXT,
  "cityId" TEXT,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "capacity" INTEGER NOT NULL DEFAULT 0,
  "registeredCount" INTEGER NOT NULL DEFAULT 0,
  "organizerName" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Upcoming',
  "isDevSeed" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "Meeting" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "hostName" TEXT NOT NULL,
  "isLive" BOOLEAN NOT NULL DEFAULT FALSE,
  "isPublic" BOOLEAN NOT NULL DEFAULT TRUE,
  "viewerCount" INTEGER NOT NULL DEFAULT 0,
  "scheduledAt" TIMESTAMPTZ NOT NULL,
  "endsAt" TIMESTAMPTZ,
  "joinUrl" TEXT,
  "stateId" TEXT,
  "isDevSeed" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "News" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "imageUrl" TEXT,
  "category" TEXT NOT NULL DEFAULT 'Community',
  "authorName" TEXT,
  "orgName" TEXT,
  "stateId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Published',
  "publishedAt" TIMESTAMPTZ NOT NULL,
  "isDevSeed" BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE TABLE IF NOT EXISTS "Notification" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "memberId" TEXT,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "iconUrl" TEXT,
  "priority" TEXT NOT NULL DEFAULT 'Normal',
  "actionLabel" TEXT,
  "actionUrl" TEXT,
  "isRead" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "Announcement" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "priority" TEXT NOT NULL DEFAULT 'Normal',
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "startsAt" TIMESTAMPTZ NOT NULL,
  "endsAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "AIKnowledgeDoc" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "sourceType" TEXT NOT NULL,
  "sourceId" TEXT,
  "content" TEXT NOT NULL,
  "tags" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "Setting" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_Setting_key" ON "Setting" ("key");
CREATE TABLE IF NOT EXISTS "HomepageSection" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "key" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "isEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "sortOrder" INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_HomepageSection_key" ON "HomepageSection" ("key");
CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "actor" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT,
  "details" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "Report" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "reporter" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Open',
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "Album" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "nameAr" TEXT,
  "description" TEXT,
  "coverUrl" TEXT,
  "isPublic" BOOLEAN NOT NULL DEFAULT TRUE,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "MediaItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "albumId" TEXT,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "thumbnailUrl" TEXT,
  "size" INTEGER NOT NULL DEFAULT 0,
  "mimeType" TEXT,
  "description" TEXT,
  "tags" TEXT,
  "uploadedBy" TEXT NOT NULL DEFAULT 'admin',
  "isPublic" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "Membership" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "memberId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "membershipType" TEXT NOT NULL DEFAULT 'STANDARD',
  "startedAt" TIMESTAMPTZ,
  "expiresAt" TIMESTAMPTZ,
  "verifiedAt" TIMESTAMPTZ,
  "verifiedBy" TEXT,
  "acceptedRulesVersion" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "MembershipApplication" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "memberId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "submittedAt" TIMESTAMPTZ NOT NULL,
  "reviewedAt" TIMESTAMPTZ,
  "reviewedBy" TEXT,
  "decisionReason" TEXT,
  "stateCode" TEXT,
  "cityName" TEXT,
  "communityConnection" TEXT,
  "rulesAcceptedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "MembershipStatusHistory" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "membershipId" TEXT NOT NULL,
  "fromStatus" TEXT,
  "toStatus" TEXT NOT NULL,
  "reason" TEXT,
  "changedBy" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "MembershipPayment" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "membershipId" TEXT NOT NULL,
  "amountCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "method" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "providerRef" TEXT,
  "paidAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "Chapter" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "nameEn" TEXT NOT NULL,
  "nameAr" TEXT NOT NULL,
  "stateCode" TEXT NOT NULL,
  "cityName" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMPTZ NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "Board" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "startDate" TIMESTAMPTZ,
  "endDate" TIMESTAMPTZ,
  "source" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "BoardMember" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "boardId" TEXT NOT NULL,
  "memberId" TEXT NOT NULL,
  "positionId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "startDate" TIMESTAMPTZ,
  "endDate" TIMESTAMPTZ,
  "source" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "Position" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "code" TEXT NOT NULL,
  "nameEn" TEXT NOT NULL,
  "nameAr" TEXT NOT NULL,
  "appointmentMethod" TEXT NOT NULL,
  "authorityScope" TEXT NOT NULL DEFAULT 'NATIONAL',
  "termMonths" INTEGER,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_Position_code" ON "Position" ("code");
CREATE TABLE IF NOT EXISTS "Office" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "code" TEXT NOT NULL,
  "nameEn" TEXT NOT NULL,
  "nameAr" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "source" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_Office_code" ON "Office" ("code");
CREATE TABLE IF NOT EXISTS "OfficeHolder" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "officeId" TEXT NOT NULL,
  "memberId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "startDate" TIMESTAMPTZ,
  "endDate" TIMESTAMPTZ,
  "appointedBy" TEXT,
  "source" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "Committee" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "code" TEXT NOT NULL,
  "nameEn" TEXT NOT NULL,
  "nameAr" TEXT NOT NULL,
  "description" TEXT,
  "scope" TEXT NOT NULL DEFAULT 'NATIONAL',
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMPTZ NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_Committee_code" ON "Committee" ("code");
CREATE TABLE IF NOT EXISTS "CommitteeMember" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "committeeId" TEXT NOT NULL,
  "memberId" TEXT NOT NULL,
  "role" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "startDate" TIMESTAMPTZ,
  "endDate" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "Appointment" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "memberId" TEXT NOT NULL,
  "positionId" TEXT,
  "officeId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PROPOSED',
  "nominatedBy" TEXT,
  "approvedBy" TEXT,
  "reason" TEXT,
  "startDate" TIMESTAMPTZ,
  "endDate" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "TransitionCommittee" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "boardId" TEXT,
  "startDate" TIMESTAMPTZ NOT NULL,
  "endDate" TIMESTAMPTZ,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "limitations" TEXT NOT NULL,
  "reportStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "Constitution" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "language" TEXT NOT NULL DEFAULT 'ar',
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "version" TEXT NOT NULL,
  "effectiveAt" TIMESTAMPTZ,
  "sourceHash" TEXT,
  "content" TEXT NOT NULL,
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "ConstitutionChapter" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "constitutionId" TEXT NOT NULL,
  "chapterNumber" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "titleEn" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "ConstitutionArticle" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "constitutionId" TEXT NOT NULL,
  "chapterId" TEXT,
  "articleCode" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "ConstitutionRule" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "code" TEXT NOT NULL,
  "articleId" TEXT NOT NULL,
  "clauseRef" TEXT,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "conditionExpr" TEXT NOT NULL,
  "effect" TEXT NOT NULL,
  "scope" TEXT NOT NULL DEFAULT 'NATIONAL',
  "severity" TEXT NOT NULL DEFAULT 'HIGH',
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "testDefinition" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_ConstitutionRule_code" ON "ConstitutionRule" ("code");
CREATE TABLE IF NOT EXISTS "ConstitutionAmendment" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "constitutionId" TEXT NOT NULL,
  "proposalTitle" TEXT NOT NULL,
  "proposedBy" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "proposedAt" TIMESTAMPTZ NOT NULL,
  "approvedAt" TIMESTAMPTZ,
  "effectiveAt" TIMESTAMPTZ,
  "resultRef" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "Bylaw" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "content" TEXT NOT NULL,
  "constitutionVersion" TEXT,
  "effectiveAt" TIMESTAMPTZ,
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "Policy" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "code" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "sourceArticles" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "effectiveAt" TIMESTAMPTZ,
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_Policy_code" ON "Policy" ("code");
CREATE TABLE IF NOT EXISTS "GovernanceDecision" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "meetingId" TEXT,
  "motionId" TEXT,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "authority" TEXT NOT NULL,
  "quorumStatus" TEXT,
  "voteResult" TEXT,
  "sourceArticle" TEXT,
  "approvedAt" TIMESTAMPTZ,
  "approvedBy" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "Resolution" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "decisionId" TEXT NOT NULL,
  "resolutionNo" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "effectiveAt" TIMESTAMPTZ,
  "certifiedAt" TIMESTAMPTZ,
  "certifiedBy" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_Resolution_resolutionNo" ON "Resolution" ("resolutionNo");
CREATE TABLE IF NOT EXISTS "GeneralAssembly" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "meetingType" TEXT NOT NULL,
  "scheduledAt" TIMESTAMPTZ NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
  "quorumRuleId" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "QuorumRule" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "threshold" TEXT NOT NULL,
  "denominator" TEXT NOT NULL,
  "sourceRule" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_QuorumRule_code" ON "QuorumRule" ("code");
CREATE TABLE IF NOT EXISTS "MeetingAgendaItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "meetingId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "requiresVote" BOOLEAN NOT NULL DEFAULT FALSE,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "MeetingMinute" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "meetingId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "content" TEXT NOT NULL,
  "approvedAt" TIMESTAMPTZ,
  "approvedBy" TEXT,
  "sourceHash" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "Election" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "nominationOpenAt" TIMESTAMPTZ,
  "nominationCloseAt" TIMESTAMPTZ,
  "votingOpenAt" TIMESTAMPTZ,
  "votingCloseAt" TIMESTAMPTZ,
  "constitutionVersion" TEXT,
  "ballotVersion" TEXT,
  "configurationHash" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "ElectionCommittee" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "electionId" TEXT NOT NULL,
  "memberId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "isCandidate" BOOLEAN NOT NULL DEFAULT FALSE,
  "appointedAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "Candidate" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "electionId" TEXT NOT NULL,
  "memberId" TEXT NOT NULL,
  "positionId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "statement" TEXT,
  "verifiedAt" TIMESTAMPTZ,
  "verifiedBy" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "VoterEligibility" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "electionId" TEXT NOT NULL,
  "memberId" TEXT NOT NULL,
  "eligible" BOOLEAN NOT NULL,
  "reason" TEXT,
  "membershipAgeDays" INTEGER,
  "evaluatedAt" TIMESTAMPTZ NOT NULL,
  "evaluatedBy" TEXT
);
CREATE TABLE IF NOT EXISTS "BallotDefinition" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "electionId" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "definition" TEXT NOT NULL,
  "definitionHash" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "frozenAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "EncryptedBallot" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "electionId" TEXT NOT NULL,
  "ballotRef" TEXT NOT NULL,
  "encryptedPayload" TEXT NOT NULL,
  "commitment" TEXT NOT NULL,
  "castAt" TIMESTAMPTZ NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'CAST'
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_EncryptedBallot_ballotRef" ON "EncryptedBallot" ("ballotRef");
CREATE TABLE IF NOT EXISTS "VoteReceipt" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "electionId" TEXT NOT NULL,
  "receiptCode" TEXT NOT NULL,
  "ballotCommitment" TEXT NOT NULL,
  "issuedAt" TIMESTAMPTZ NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_VoteReceipt_receiptCode" ON "VoteReceipt" ("receiptCode");
CREATE TABLE IF NOT EXISTS "ElectionTally" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "electionId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "tallyVersion" TEXT NOT NULL,
  "resultPayload" TEXT NOT NULL,
  "resultHash" TEXT NOT NULL,
  "startedAt" TIMESTAMPTZ,
  "completedAt" TIMESTAMPTZ,
  "executedBy" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "ElectionResult" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "electionId" TEXT NOT NULL,
  "positionId" TEXT,
  "candidateId" TEXT,
  "voteCount" INTEGER NOT NULL DEFAULT 0,
  "percentage" DOUBLE PRECISION,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "certifiedAt" TIMESTAMPTZ,
  "certifiedBy" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "ElectionAppeal" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "electionId" TEXT NOT NULL,
  "appellantId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "evidence" TEXT,
  "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
  "decision" TEXT,
  "decidedBy" TEXT,
  "decidedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "ElectionAudit" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "electionId" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "event" TEXT NOT NULL,
  "details" TEXT,
  "actor" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "ServiceRequest" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "memberId" TEXT NOT NULL,
  "serviceCode" TEXT NOT NULL,
  "stateCode" TEXT,
  "chapterId" TEXT,
  "language" TEXT,
  "urgency" TEXT NOT NULL DEFAULT 'NORMAL',
  "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
  "description" TEXT NOT NULL,
  "assignedTo" TEXT,
  "resolvedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "VolunteerProfile" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "memberId" TEXT NOT NULL,
  "skills" TEXT,
  "availability" TEXT,
  "interests" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMPTZ NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_VolunteerProfile_memberId" ON "VolunteerProfile" ("memberId");
CREATE TABLE IF NOT EXISTS "LegalDocument" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "titleAr" TEXT,
  "documentType" TEXT NOT NULL,
  "organizationName" TEXT,
  "jurisdiction" TEXT,
  "issuingAuthority" TEXT,
  "filingDate" TIMESTAMPTZ,
  "acknowledgmentNo" TEXT,
  "authenticationNo" TEXT,
  "verificationUrl" TEXT,
  "fileUrl" TEXT NOT NULL,
  "originalFileHash" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
  "version" TEXT NOT NULL DEFAULT '1.0',
  "publishedAt" TIMESTAMPTZ,
  "approvedAt" TIMESTAMPTZ,
  "approvedBy" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "ComplianceRule" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "code" TEXT NOT NULL,
  "sourceType" TEXT NOT NULL,
  "sourceRef" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "severity" TEXT NOT NULL DEFAULT 'HIGH',
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_ComplianceRule_code" ON "ComplianceRule" ("code");
CREATE TABLE IF NOT EXISTS "ComplianceCheck" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "ruleId" TEXT NOT NULL,
  "resource" TEXT NOT NULL,
  "resourceId" TEXT,
  "result" TEXT NOT NULL,
  "evidence" TEXT,
  "checkedAt" TIMESTAMPTZ NOT NULL,
  "checkedBy" TEXT
);
CREATE TABLE IF NOT EXISTS "ComplianceAlert" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "ruleId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "details" TEXT NOT NULL,
  "assignedTo" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL,
  "resolvedAt" TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS "ModerationCase" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "reporterId" TEXT,
  "category" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
  "reason" TEXT NOT NULL,
  "ruleCode" TEXT,
  "assignedTo" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL,
  "resolvedAt" TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS "ModerationDecision" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "caseId" TEXT NOT NULL,
  "decision" TEXT NOT NULL,
  "rationale" TEXT NOT NULL,
  "decidedBy" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "ModerationAppeal" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "caseId" TEXT NOT NULL,
  "appellantId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
  "decidedBy" TEXT,
  "decision" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "RiskRegister" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "code" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "likelihood" INTEGER NOT NULL DEFAULT 1,
  "impact" INTEGER NOT NULL DEFAULT 1,
  "score" INTEGER NOT NULL DEFAULT 1,
  "owner" TEXT,
  "treatment" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "reviewDate" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_RiskRegister_code" ON "RiskRegister" ("code");
CREATE TABLE IF NOT EXISTS "ChangeRequest" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "impact" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "requestedBy" TEXT NOT NULL,
  "approvedBy" TEXT,
  "scheduledAt" TIMESTAMPTZ,
  "appliedAt" TIMESTAMPTZ,
  "verificationAt" TIMESTAMPTZ,
  "rollbackPlan" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "SecurityIncident" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DETECTED',
  "owner" TEXT,
  "details" TEXT NOT NULL,
  "detectedAt" TIMESTAMPTZ NOT NULL,
  "resolvedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "PrivacyRequest" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "memberId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
  "details" TEXT,
  "requestedAt" TIMESTAMPTZ NOT NULL,
  "completedAt" TIMESTAMPTZ,
  "handledBy" TEXT
);
CREATE TABLE IF NOT EXISTS "PushSubscription" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "memberId" TEXT NOT NULL,
  "endpoint" TEXT NOT NULL,
  "p256dh" TEXT NOT NULL,
  "auth" TEXT NOT NULL,
  "deviceLabel" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL,
  "revokedAt" TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_PushSubscription_endpoint" ON "PushSubscription" ("endpoint");
CREATE TABLE IF NOT EXISTS "EventRegistration" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "eventId" TEXT NOT NULL,
  "memberId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'REGISTERED',
  "registeredAt" TIMESTAMPTZ NOT NULL,
  "attendedAt" TIMESTAMPTZ,
  "cancelledAt" TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT,
  "phoneE164" TEXT,
  "displayName" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "memberId" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_User_email" ON "User" ("email");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_User_phoneE164" ON "User" ("phoneE164");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_User_memberId" ON "User" ("memberId");
CREATE TABLE IF NOT EXISTS "Account" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "Session" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "sessionHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "revokedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL,
  "lastSeenAt" TIMESTAMPTZ,
  "ipHash" TEXT,
  "userAgentHash" TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_Session_sessionHash" ON "Session" ("sessionHash");
CREATE TABLE IF NOT EXISTS "MFAFactor" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "label" TEXT,
  "secretRef" TEXT,
  "verifiedAt" TIMESTAMPTZ,
  "revokedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "RecoveryCode" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "usedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "Role" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "code" TEXT NOT NULL,
  "nameEn" TEXT NOT NULL,
  "nameAr" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_Role_code" ON "Role" ("code");
CREATE TABLE IF NOT EXISTS "Permission" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "code" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_Permission_code" ON "Permission" ("code");
CREATE TABLE IF NOT EXISTS "RolePermission" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "roleId" TEXT NOT NULL,
  "permissionId" TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS "UserRole" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "roleId" TEXT NOT NULL,
  "scopeType" TEXT NOT NULL DEFAULT 'NATIONAL',
  "scopeId" TEXT,
  "startsAt" TIMESTAMPTZ NOT NULL,
  "endsAt" TIMESTAMPTZ,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE'
);
CREATE TABLE IF NOT EXISTS "GovernanceTrace" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "articleRef" TEXT,
  "ruleCode" TEXT,
  "policyCode" TEXT,
  "permissionCode" TEXT,
  "workflowCode" TEXT,
  "apiRoute" TEXT,
  "databaseEntity" TEXT,
  "testId" TEXT,
  "evidenceRef" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMPTZ NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "Control" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "code" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "owner" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_Control_code" ON "Control" ("code");
CREATE TABLE IF NOT EXISTS "ControlTest" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "controlId" TEXT NOT NULL,
  "result" TEXT NOT NULL,
  "evidence" TEXT,
  "executedAt" TIMESTAMPTZ NOT NULL,
  "executedBy" TEXT
);
CREATE TABLE IF NOT EXISTS "PolicyAcknowledgement" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "policyCode" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "acceptedAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "Complaint" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "reporterId" TEXT,
  "category" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "details" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
  "assignedTo" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL,
  "resolvedAt" TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS "Suggestion" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "memberId" TEXT,
  "subject" TEXT NOT NULL,
  "details" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
  "createdAt" TIMESTAMPTZ NOT NULL,
  "reviewedAt" TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS "ServiceProvider" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "organizationId" TEXT,
  "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "stateCode" TEXT,
  "cityName" TEXT,
  "languages" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "ServiceAssignment" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "serviceRequestId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
  "assignedAt" TIMESTAMPTZ NOT NULL,
  "completedAt" TIMESTAMPTZ,
  "notes" TEXT
);
CREATE TABLE IF NOT EXISTS "Referral" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "serviceRequestId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "reason" TEXT,
  "status" TEXT NOT NULL DEFAULT 'REFERRED',
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "ServiceResolution" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "serviceRequestId" TEXT NOT NULL,
  "resolution" TEXT NOT NULL,
  "outcome" TEXT,
  "resolvedBy" TEXT NOT NULL,
  "resolvedAt" TIMESTAMPTZ NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_ServiceResolution_serviceRequestId" ON "ServiceResolution" ("serviceRequestId");
CREATE TABLE IF NOT EXISTS "Job" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "employer" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "location" TEXT,
  "stateCode" TEXT,
  "remote" BOOLEAN NOT NULL DEFAULT FALSE,
  "applicationUrl" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
  "expiresAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "Business" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "description" TEXT,
  "ownerMemberId" TEXT,
  "stateCode" TEXT,
  "cityName" TEXT,
  "website" TEXT,
  "phone" TEXT,
  "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMPTZ NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "BusinessClaim" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "businessId" TEXT NOT NULL,
  "memberId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMPTZ NOT NULL,
  "reviewedAt" TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS "BusinessVerification" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "businessId" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "verifiedBy" TEXT,
  "verifiedAt" TIMESTAMPTZ,
  "expiresAt" TIMESTAMPTZ,
  "evidenceRef" TEXT
);
CREATE TABLE IF NOT EXISTS "Volunteer" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "memberId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "skills" TEXT,
  "availability" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_Volunteer_memberId" ON "Volunteer" ("memberId");
CREATE TABLE IF NOT EXISTS "VolunteerApplication" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "volunteerId" TEXT NOT NULL,
  "program" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "VolunteerAssignment" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "volunteerId" TEXT NOT NULL,
  "activity" TEXT NOT NULL,
  "startAt" TIMESTAMPTZ,
  "endAt" TIMESTAMPTZ,
  "status" TEXT NOT NULL DEFAULT 'ASSIGNED'
);
CREATE TABLE IF NOT EXISTS "VolunteerHours" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "volunteerId" TEXT NOT NULL,
  "hours" DOUBLE PRECISION NOT NULL,
  "loggedAt" TIMESTAMPTZ NOT NULL,
  "verifiedBy" TEXT
);
CREATE TABLE IF NOT EXISTS "NotificationPreference" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "memberId" TEXT NOT NULL,
  "channel" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "quietFrom" TEXT,
  "quietTo" TEXT
);
CREATE TABLE IF NOT EXISTS "ConsentRecord" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "memberId" TEXT NOT NULL,
  "consentType" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "granted" BOOLEAN NOT NULL,
  "recordedAt" TIMESTAMPTZ NOT NULL,
  "revokedAt" TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS "ModerationRule" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "code" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "sourceRef" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE'
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_ModerationRule_code" ON "ModerationRule" ("code");
CREATE TABLE IF NOT EXISTS "SecurityEvent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "category" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "actorId" TEXT,
  "resource" TEXT,
  "resourceId" TEXT,
  "details" TEXT,
  "ipHash" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "DataExportRequest" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "memberId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'REQUESTED',
  "format" TEXT NOT NULL DEFAULT 'JSON',
  "requestedAt" TIMESTAMPTZ NOT NULL,
  "completedAt" TIMESTAMPTZ,
  "fileUrl" TEXT
);
CREATE TABLE IF NOT EXISTS "DataCorrectionRequest" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "memberId" TEXT NOT NULL,
  "details" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'REQUESTED',
  "requestedAt" TIMESTAMPTZ NOT NULL,
  "completedAt" TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS "AccountDeletionRequest" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "memberId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'REQUESTED',
  "requestedAt" TIMESTAMPTZ NOT NULL,
  "approvedAt" TIMESTAMPTZ,
  "completedAt" TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS "JobRun" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "jobName" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "startedAt" TIMESTAMPTZ NOT NULL,
  "finishedAt" TIMESTAMPTZ,
  "details" TEXT
);
CREATE TABLE IF NOT EXISTS "DataQualityFinding" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "category" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT,
  "details" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMPTZ NOT NULL,
  "resolvedAt" TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS "MemberSession" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "memberId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "revokedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL,
  "lastSeenAt" TIMESTAMPTZ,
  "ipHash" TEXT,
  "userAgentHash" TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS "uq_MemberSession_tokenHash" ON "MemberSession" ("tokenHash");
CREATE TABLE IF NOT EXISTS "Follow" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "memberId" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_USState_isActive" ON "USState" ("isActive");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_USCity_stateId_nameEn" ON "USCity" ("stateId", "nameEn");
CREATE INDEX IF NOT EXISTS "idx_USCity_stateId_isActive" ON "USCity" ("stateId", "isActive");
CREATE INDEX IF NOT EXISTS "idx_Member_stateId_cityId" ON "Member" ("stateId", "cityId");
CREATE INDEX IF NOT EXISTS "idx_Member_accountState" ON "Member" ("accountState");
CREATE INDEX IF NOT EXISTS "idx_Organization_stateId_cityId" ON "Organization" ("stateId", "cityId");
CREATE INDEX IF NOT EXISTS "idx_Organization_verification" ON "Organization" ("verification");
CREATE INDEX IF NOT EXISTS "idx_Organization_type" ON "Organization" ("type");
CREATE INDEX IF NOT EXISTS "idx_Event_eventDate_status" ON "Event" ("eventDate", "status");
CREATE INDEX IF NOT EXISTS "idx_Event_stateId_status" ON "Event" ("stateId", "status");
CREATE INDEX IF NOT EXISTS "idx_Meeting_isLive_scheduledAt" ON "Meeting" ("isLive", "scheduledAt");
CREATE INDEX IF NOT EXISTS "idx_News_status_publishedAt" ON "News" ("status", "publishedAt");
CREATE INDEX IF NOT EXISTS "idx_News_category_status" ON "News" ("category", "status");
CREATE INDEX IF NOT EXISTS "idx_Notification_memberId_isRead_createdAt" ON "Notification" ("memberId", "isRead", "createdAt");
CREATE INDEX IF NOT EXISTS "idx_Announcement_isActive_startsAt_endsAt" ON "Announcement" ("isActive", "startsAt", "endsAt");
CREATE INDEX IF NOT EXISTS "idx_AIKnowledgeDoc_sourceType_isActive" ON "AIKnowledgeDoc" ("sourceType", "isActive");
CREATE INDEX IF NOT EXISTS "idx_AuditLog_entity_entityId" ON "AuditLog" ("entity", "entityId");
CREATE INDEX IF NOT EXISTS "idx_AuditLog_createdAt" ON "AuditLog" ("createdAt");
CREATE INDEX IF NOT EXISTS "idx_Report_status_createdAt" ON "Report" ("status", "createdAt");
CREATE INDEX IF NOT EXISTS "idx_Album_isPublic_sortOrder" ON "Album" ("isPublic", "sortOrder");
CREATE INDEX IF NOT EXISTS "idx_MediaItem_albumId_isPublic" ON "MediaItem" ("albumId", "isPublic");
CREATE INDEX IF NOT EXISTS "idx_MediaItem_type_isPublic" ON "MediaItem" ("type", "isPublic");
CREATE INDEX IF NOT EXISTS "idx_MediaItem_createdAt" ON "MediaItem" ("createdAt");
CREATE INDEX IF NOT EXISTS "idx_Membership_memberId_status" ON "Membership" ("memberId", "status");
CREATE INDEX IF NOT EXISTS "idx_Membership_expiresAt_status" ON "Membership" ("expiresAt", "status");
CREATE INDEX IF NOT EXISTS "idx_MembershipApplication_memberId_status" ON "MembershipApplication" ("memberId", "status");
CREATE INDEX IF NOT EXISTS "idx_MembershipApplication_status_submittedAt" ON "MembershipApplication" ("status", "submittedAt");
CREATE INDEX IF NOT EXISTS "idx_MembershipStatusHistory_membershipId_createdAt" ON "MembershipStatusHistory" ("membershipId", "createdAt");
CREATE INDEX IF NOT EXISTS "idx_MembershipPayment_membershipId_status" ON "MembershipPayment" ("membershipId", "status");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_Chapter_nameEn_stateCode" ON "Chapter" ("nameEn", "stateCode");
CREATE INDEX IF NOT EXISTS "idx_Chapter_stateCode_status" ON "Chapter" ("stateCode", "status");
CREATE INDEX IF NOT EXISTS "idx_BoardMember_boardId_status" ON "BoardMember" ("boardId", "status");
CREATE INDEX IF NOT EXISTS "idx_BoardMember_memberId_status" ON "BoardMember" ("memberId", "status");
CREATE INDEX IF NOT EXISTS "idx_OfficeHolder_officeId_status" ON "OfficeHolder" ("officeId", "status");
CREATE INDEX IF NOT EXISTS "idx_OfficeHolder_memberId_status" ON "OfficeHolder" ("memberId", "status");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_CommitteeMember_committeeId_memberId" ON "CommitteeMember" ("committeeId", "memberId");
CREATE INDEX IF NOT EXISTS "idx_CommitteeMember_memberId_status" ON "CommitteeMember" ("memberId", "status");
CREATE INDEX IF NOT EXISTS "idx_Constitution_status_version" ON "Constitution" ("status", "version");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_ConstitutionChapter_constitutionId_chapterNumber" ON "ConstitutionChapter" ("constitutionId", "chapterNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_ConstitutionArticle_constitutionId_articleCode" ON "ConstitutionArticle" ("constitutionId", "articleCode");
CREATE INDEX IF NOT EXISTS "idx_ConstitutionArticle_chapterId_sortOrder" ON "ConstitutionArticle" ("chapterId", "sortOrder");
CREATE INDEX IF NOT EXISTS "idx_ConstitutionRule_articleId_status" ON "ConstitutionRule" ("articleId", "status");
CREATE INDEX IF NOT EXISTS "idx_MeetingAgendaItem_meetingId_sortOrder" ON "MeetingAgendaItem" ("meetingId", "sortOrder");
CREATE INDEX IF NOT EXISTS "idx_Election_status_votingOpenAt" ON "Election" ("status", "votingOpenAt");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_ElectionCommittee_electionId_memberId" ON "ElectionCommittee" ("electionId", "memberId");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_Candidate_electionId_memberId_positionId" ON "Candidate" ("electionId", "memberId", "positionId");
CREATE INDEX IF NOT EXISTS "idx_Candidate_electionId_status" ON "Candidate" ("electionId", "status");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_VoterEligibility_electionId_memberId" ON "VoterEligibility" ("electionId", "memberId");
CREATE INDEX IF NOT EXISTS "idx_VoterEligibility_electionId_eligible" ON "VoterEligibility" ("electionId", "eligible");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_BallotDefinition_electionId_version" ON "BallotDefinition" ("electionId", "version");
CREATE INDEX IF NOT EXISTS "idx_EncryptedBallot_electionId_castAt" ON "EncryptedBallot" ("electionId", "castAt");
CREATE INDEX IF NOT EXISTS "idx_ElectionAudit_electionId_createdAt" ON "ElectionAudit" ("electionId", "createdAt");
CREATE INDEX IF NOT EXISTS "idx_ServiceRequest_memberId_status" ON "ServiceRequest" ("memberId", "status");
CREATE INDEX IF NOT EXISTS "idx_ServiceRequest_status_createdAt" ON "ServiceRequest" ("status", "createdAt");
CREATE INDEX IF NOT EXISTS "idx_LegalDocument_documentType_status" ON "LegalDocument" ("documentType", "status");
CREATE INDEX IF NOT EXISTS "idx_ComplianceCheck_ruleId_result" ON "ComplianceCheck" ("ruleId", "result");
CREATE INDEX IF NOT EXISTS "idx_ModerationCase_status_severity_createdAt" ON "ModerationCase" ("status", "severity", "createdAt");
CREATE INDEX IF NOT EXISTS "idx_PushSubscription_memberId_revokedAt" ON "PushSubscription" ("memberId", "revokedAt");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_EventRegistration_eventId_memberId" ON "EventRegistration" ("eventId", "memberId");
CREATE INDEX IF NOT EXISTS "idx_EventRegistration_eventId_status" ON "EventRegistration" ("eventId", "status");
CREATE INDEX IF NOT EXISTS "idx_User_status" ON "User" ("status");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_Account_provider_providerAccountId" ON "Account" ("provider", "providerAccountId");
CREATE INDEX IF NOT EXISTS "idx_Account_userId" ON "Account" ("userId");
CREATE INDEX IF NOT EXISTS "idx_Session_userId_revokedAt" ON "Session" ("userId", "revokedAt");
CREATE INDEX IF NOT EXISTS "idx_Session_expiresAt" ON "Session" ("expiresAt");
CREATE INDEX IF NOT EXISTS "idx_MFAFactor_userId_revokedAt" ON "MFAFactor" ("userId", "revokedAt");
CREATE INDEX IF NOT EXISTS "idx_RecoveryCode_userId_usedAt" ON "RecoveryCode" ("userId", "usedAt");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_RolePermission_roleId_permissionId" ON "RolePermission" ("roleId", "permissionId");
CREATE INDEX IF NOT EXISTS "idx_UserRole_userId_status" ON "UserRole" ("userId", "status");
CREATE INDEX IF NOT EXISTS "idx_UserRole_roleId_scopeType_scopeId" ON "UserRole" ("roleId", "scopeType", "scopeId");
CREATE INDEX IF NOT EXISTS "idx_GovernanceTrace_ruleCode_status" ON "GovernanceTrace" ("ruleCode", "status");
CREATE INDEX IF NOT EXISTS "idx_ControlTest_controlId_result" ON "ControlTest" ("controlId", "result");
CREATE INDEX IF NOT EXISTS "idx_PolicyAcknowledgement_userId_policyCode" ON "PolicyAcknowledgement" ("userId", "policyCode");
CREATE INDEX IF NOT EXISTS "idx_Complaint_status_severity_createdAt" ON "Complaint" ("status", "severity", "createdAt");
CREATE INDEX IF NOT EXISTS "idx_ServiceProvider_category_verificationStatus" ON "ServiceProvider" ("category", "verificationStatus");
CREATE INDEX IF NOT EXISTS "idx_Job_status_expiresAt" ON "Job" ("status", "expiresAt");
CREATE INDEX IF NOT EXISTS "idx_Business_category_verificationStatus" ON "Business" ("category", "verificationStatus");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_NotificationPreference_memberId_channel_category" ON "NotificationPreference" ("memberId", "channel", "category");
CREATE INDEX IF NOT EXISTS "idx_SecurityEvent_category_severity_createdAt" ON "SecurityEvent" ("category", "severity", "createdAt");
CREATE INDEX IF NOT EXISTS "idx_MemberSession_memberId_revokedAt" ON "MemberSession" ("memberId", "revokedAt");
CREATE INDEX IF NOT EXISTS "idx_MemberSession_expiresAt" ON "MemberSession" ("expiresAt");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_Follow_memberId_targetType_targetId" ON "Follow" ("memberId", "targetType", "targetId");
CREATE INDEX IF NOT EXISTS "idx_Follow_memberId_targetType" ON "Follow" ("memberId", "targetType");
ALTER TABLE "USCity" ADD CONSTRAINT "fk_USCity_stateId_USState_id" FOREIGN KEY ("stateId") REFERENCES "USState" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Member" ADD CONSTRAINT "fk_Member_stateId_USState_id" FOREIGN KEY ("stateId") REFERENCES "USState" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Member" ADD CONSTRAINT "fk_Member_cityId_USCity_id" FOREIGN KEY ("cityId") REFERENCES "USCity" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Organization" ADD CONSTRAINT "fk_Organization_stateId_USState_id" FOREIGN KEY ("stateId") REFERENCES "USState" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Organization" ADD CONSTRAINT "fk_Organization_cityId_USCity_id" FOREIGN KEY ("cityId") REFERENCES "USCity" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Event" ADD CONSTRAINT "fk_Event_stateId_USState_id" FOREIGN KEY ("stateId") REFERENCES "USState" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Meeting" ADD CONSTRAINT "fk_Meeting_stateId_USState_id" FOREIGN KEY ("stateId") REFERENCES "USState" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "News" ADD CONSTRAINT "fk_News_stateId_USState_id" FOREIGN KEY ("stateId") REFERENCES "USState" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MediaItem" ADD CONSTRAINT "fk_MediaItem_albumId_Album_id" FOREIGN KEY ("albumId") REFERENCES "Album" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;
