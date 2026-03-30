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
            - paragraph [ref=e13]: Email is required
          - generic [ref=e14]:
            - text: Password
            - generic [ref=e15]:
              - textbox "Password" [ref=e16]
              - button "Show password" [ref=e17] [cursor=pointer]:
                - img [ref=e18]
            - paragraph [ref=e21]: Password is required
          - button "Sign Up" [active] [ref=e22] [cursor=pointer]
        - paragraph [ref=e23]:
          - text: Already have an account?
          - button "Sign In" [ref=e24] [cursor=pointer]
  - complementary "Edit with Lovable" [ref=e25]:
    - link "Edit with Lovable" [ref=e26] [cursor=pointer]:
      - /url: https://lovable.dev/projects/3b7259e3-e145-49ad-8358-1082fb3fdfe8?utm_source=lovable-badge
      - generic [ref=e27]: Edit with
      - img [ref=e28]
    - button "Dismiss" [ref=e33] [cursor=pointer]:
      - img [ref=e34]
```