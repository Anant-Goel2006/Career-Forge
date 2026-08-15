# Data Model

users(id, email, name, role, created_at)
resumes(id, user_id, filename, source_type, storage_key, status, created_at, deleted_at)
resume_sections(id, resume_id, section_type, raw_text, normalized_text, order_index)
evidence_items(id, user_id, resume_id, claim_text, source_span, verified, created_at)
jobs(id, source, external_id, company, title, location, employment_type, experience_level, description, application_url, posted_at)
job_requirements(id, job_id, requirement_type, requirement_text, normalized_skill, priority)
match_reports(id, user_id, resume_id, job_id, score_json, gaps_json, created_at)
resume_versions(id, user_id, base_resume_id, job_id, template, content_json, docx_storage_key, pdf_storage_key, readiness_score, created_at)
applications(id, user_id, job_id, resume_version_id, status, applied_at, follow_up_at)
contacts(id, job_id, name, role, organization, public_profile_url, source_url, confidence, created_at)
outreach_drafts(id, user_id, job_id, contact_id, channel, subject, body, status, created_at)
audit_logs(id, user_id, action, resource_type, resource_id, metadata_json, created_at)

Relationships:
User→Resumes; Resume→Sections/Evidence; Job→Requirements; Resume×Job→MatchReport; ResumeVersion→Resume/Job; Application→Job/ResumeVersion; Contact→Job; OutreachDraft→Job/Contact.
