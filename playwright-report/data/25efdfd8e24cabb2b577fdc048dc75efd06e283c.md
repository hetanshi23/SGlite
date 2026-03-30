# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - region "Notifications (F8)":
      - list
    - region "Notifications alt+T"
    - generic [ref=e4]:
      - generic [ref=e5]:
        - img "SGlite" [ref=e7]
        - paragraph [ref=e8]: Create a new account
      - generic [ref=e9]:
        - generic [ref=e10]:
          - generic [ref=e11]:
            - text: Email
            - textbox "Email" [ref=e12]:
              - /placeholder: you@example.com
              - text: testuser_1774866596599@example.com
          - generic [ref=e13]:
            - text: Password
            - generic [ref=e14]:
              - textbox "Password" [ref=e15]: NewUser@123
              - button "Show password" [ref=e16] [cursor=pointer]:
                - img [ref=e17]
          - button "Loading..." [disabled]
        - paragraph [ref=e20]:
          - text: Already have an account?
          - button "Sign In" [ref=e21] [cursor=pointer]
  - complementary "Edit with Lovable" [ref=e22]:
    - link "Edit with Lovable" [ref=e23] [cursor=pointer]:
      - /url: https://lovable.dev/projects/3b7259e3-e145-49ad-8358-1082fb3fdfe8?utm_source=lovable-badge
      - generic [ref=e24]: Edit with
      - img [ref=e25]
    - button "Dismiss" [ref=e30] [cursor=pointer]:
      - img [ref=e31]
```