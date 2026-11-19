---
"@spudly/ui": major
---

ProfilePage and SignUpPage: removed the `legalLinks` and `legalNotice` render slots. ProfilePage now takes its Legal section links as `legalLinks` data (label + href pairs) and renders them itself; SignUpPage and SignUpForm take the sign-up legal notice as `legalNotice` copy data (an ordered run of text and link spans) and render it centered under the submit button. The legal text itself stays host-supplied data, unchanged.
