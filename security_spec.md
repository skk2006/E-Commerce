# Security Specification - EliteCommerce

## Data Invariants
1. A user profile (`/users/{uid}`) can only be created with the user's own UID and `role` must default to 'user' unless created by an existing admin.
2. Products (`/products/{pid}`) can only be created/updated/deleted by an admin.
3. Orders (`/orders/{oid}`) can be created by any authenticated user. Once created, they are immutable by the user, except for status updates which are admin-only.
4. Users can only read their own orders. Admins can read all orders.
5. Carts (`/users/{uid}/cart/{pid}`) are private to the user.

## The Dirty Dozen (Attack Payloads)

1. **Identity Theft**: authenticated user `A` tries to create profile `/users/B`.
2. **Privilege Escalation**: User tries to set `role: 'admin'` on their own profile during creation.
3. **Price Manipulation**: User tries to update a product's price.
4. **Order Forgery**: User tries to create an order for `userId: 'someone_else'`.
5. **Inventory Poisoning**: User tries to set product stock to a negative number or a massive string.
6. **Cart Sniffing**: User `A` tries to read `/users/B/cart`.
7. **Order Outcome Injection**: User tries to update their own order status to `delivered`.
8. **Shadow Field Injection**: User tries to add `isVerified: true` to a product they shouldn't even be editing.
9. **Junk ID Poisoning**: Attacker tries to create a product with a 1MB string as the ID.
10. **Resource Exhaustion**: Attacker tries to send a 1MB string for product name.
11. **Orphaned Order**: User creates order referencing a non-existent product ID.
12. **System Field Tampering**: User tries to modify `createdAt` on a product.

## Test Strategy
I will generate rules that specifically check `request.auth.uid`, enforce schema validation via `isValid[Entity]`, and restrict field updates with `affectedKeys().hasOnly()`.
