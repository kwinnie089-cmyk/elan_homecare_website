ELAN HOMECARE NURSING WEBSITE

Files:
- index.html: page content and structure
- style.css: colours, layout and responsive design
- script.js: mobile menu and enquiry form behaviour

OPEN IN VS CODE
1. Extract the ZIP file.
2. Open VS Code.
3. Select File > Open Folder.
4. Choose the extracted elan_homecare_website folder.
5. Open index.html.
6. If you have the Live Server extension, right-click index.html and choose
   Open with Live Server. Otherwise, open index.html in Chrome.

PUBLISH WITH GITHUB PAGES
1. Push the project, including .github/workflows/pages.yml, to the main branch.
2. In GitHub, open Settings > General > Danger Zone and change repository
   visibility to Public. This makes the source files public too.
3. Open Settings > Pages and set the build and deployment source to GitHub Actions.
4. Open Actions and wait for "Deploy static website to GitHub Pages" to finish.
5. The public website link will be
   https://kwinnie089-cmyk.github.io/elan_homecare_website/
   Open that link on the phone.

IMPORTANT BEFORE PUBLISHING
- Confirm that the three telephone numbers and email address are correct.
- Confirm the service descriptions and approve all wording with the client.
- Replace the sample stock photographs with client-approved images if available.
- The email enquiry button opens a prefilled Gmail draft; WhatsApp lets
  visitors choose a number and opens a prefilled message. Neither option stores
  submissions on this website. Enquiries include the visitor's location.
- The form currently uses elanhomenursing@gmail.com.
- Reviews are private and require a Supabase project. Follow "PRIVATE REVIEWS
  SETUP" below before enabling review submissions or the admin dashboard.
- This is a front-end starter. No patient records or sensitive health information
  should be collected through it.

PRIVATE REVIEWS SETUP
1. Create a Supabase project at https://supabase.com/dashboard.
2. In SQL Editor, run supabase/schema.sql. The policy lets anyone submit a
   review but only an authenticated user with the Elan admin email can view them.
3. In Authentication > Users, create an admin user for elanhomenursing@gmail.com
   and set a strong password. Do not put that password in this repository.
4. In Project Settings > API, copy the Project URL and publishable (or anon)
   key into supabase-config.js. This key is intended for browser use; never use
   the service-role key in the website. Save and push the config change.
5. Deploy the site, then open /admin.html and sign in with the admin account.
6. Reviews submitted before this setup were stored in individual browsers and
   cannot be moved into the shared dashboard automatically.
