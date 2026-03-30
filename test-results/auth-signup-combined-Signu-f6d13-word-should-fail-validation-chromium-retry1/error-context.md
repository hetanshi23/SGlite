# Page snapshot

```yaml
- generic [ref=e1]:
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
              - text: testuser_1774867364676@example.com
          - generic [ref=e13]:
            - text: Password
            - generic [ref=e14]:
              - textbox "Password" [ref=e15]: Pass1
              - button "Show password" [ref=e16] [cursor=pointer]:
                - img [ref=e17]
            - paragraph [ref=e20]: Password must be at least 8 characters long
          - button "Sign Up" [active] [ref=e21] [cursor=pointer]
        - paragraph [ref=e22]:
          - text: Already have an account?
          - button "Sign In" [ref=e23] [cursor=pointer]
  - complementary "Edit with Lovable" [ref=e24]:
    - link "Edit with Lovable" [ref=e25] [cursor=pointer]:
      - /url: https://lovable.dev/projects/3b7259e3-e145-49ad-8358-1082fb3fdfe8?utm_source=lovable-badge
      - generic [ref=e26]: Edit with
      - img [ref=e27]
    - button "Dismiss" [ref=e32] [cursor=pointer]:
      - img [ref=e33]
```