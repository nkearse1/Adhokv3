# 🗺️ Adhok V.1 Route Overview (Updated at Adhok 1.2c)

## 👤 Talent Signup & Qualification
| Route                | Purpose                                                |
|----------------------|--------------------------------------------------------|
| `/signup`            | Public signup form for talents (`TalentSignUpForm.tsx`) |
| `/talent/dashboard`  | Status-based dashboard (pending/approved/rejected)    |
| `/api/talent/signup` | Handles resume upload and DB insert via Supabase      |

## 🧳 Projects & Bidding
| Route                | Purpose                                              |
|----------------------|------------------------------------------------------|
| `/talent/projects`   | Talent sees open projects + inline bid submission     |
| `/client/dashboard`  | Project creators post new jobs (`UploadFlow.tsx`)     |
| `/api/project/post`  | Planned: endpoint for project creation                |
| `/api/bid/submit`    | Planned: endpoint to store bids                       |

## 🔐 Admin & Review (Planned/Mocked)
| Route                | Purpose                                              |
|----------------------|------------------------------------------------------|
| `/admin/talents`     | Admin mock view to approve/reject talents            |
| `/admin/projects`    | Admin planned view of posted projects                 |
| `/admin/casestudies` | Admin follow-up success feedback                     |

## ✅ Milestone: Adhok 1.2c
- `/talent/projects` implemented with inline bidding (mock data)
- Status dashboard and signup system working

## 🧭 Navigation Suggestions
Top-level nav should include:
- Sign Up
- Browse Projects
- Post Project
- Talent Dashboard

(Conditionally shown based on user role)