# Implementation Plan

## Data Layer

- [x] 1. Create notification data models and types
  - Create `src/app/shared/data/notifications/notifications.models.ts` with `Notification`, `NotificationsListResponse`, and `MarkAsReadRequest` interfaces
  - Export models via `src/app/shared/data/notifications/index.ts`
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1_

- [ ] 2. Implement notifications API service
  - Create `src/app/shared/data/notifications/notifications-api.service.ts` with methods: `fetchAll()`, `markAsRead(id)`, `markAllAsRead()`
  - Use `HttpClient` with `lastValueFrom` pattern following existing `functional-api.service.ts`
  - Configure base URL to `http://localhost:3000/notifications`
  - _Requirements: 2.5, 5.2, 5.3, 6.1_

- [ ] 3. Create TanStack Query integration for notifications
  - Create `src/app/shared/data/notifications/notifications.queries.ts` with query functions: `listQuery()`, `markAsReadMutation()`, `markAllAsReadMutation()`
  - Configure query with `staleTime: 30s`, `gcTime: 5min`, `refetchInterval: 60s`
  - Implement cache invalidation on mutations
  - Export `notificationsQuery` object with all query functions
  - _Requirements: 2.5, 5.2, 5.3, 7.1_

- [ ] 4. Set up mock notification data
  - Add notifications array to `db.json` with sample data (5-10 notification objects with varying read/unread status)
  - Include fields: id, senderName, message, timestamp, isRead, actionUrl
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1_

## UI Components

- [ ] 5. Create notification data models for UI
  - Create `src/app/shared/ui/notification-bell/notification-bell.models.ts` (can re-export from data layer)
  - Create barrel export file `src/app/shared/ui/notification-bell/index.ts`
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 6. Implement NotificationItemComponent
  - Create `src/app/shared/ui/notification-bell/notification-item.component.ts` with standalone component
  - Add input: `notification` (required signal input)
  - Implement `truncatedMessage()` computed signal (150 char limit with ellipsis)
  - Implement `formattedTime()` computed signal using `Intl.RelativeTimeFormat` for today, `Intl.DateTimeFormat` for past dates
  - Add template with sender name, truncated message, formatted timestamp, and unread indicator dot
  - Apply conditional styling for read/unread states (background color, bold text)
  - Import PrimeNG `RippleModule` and add `pRipple` directive
  - Use OnPush change detection
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.1, 6.2, 6.3_

- [ ] 7. Implement NotificationListComponent
  - Create `src/app/shared/ui/notification-bell/notification-list.component.ts` with standalone component
  - Add input: `notifications` (required signal input array)
  - Add outputs: `notificationClick`, `markAllRead`
  - Implement `hasUnread()` computed signal
  - Add template with header, "Mark all as read" button (conditional on `hasUnread()`), and empty state
  - Render list of `ui-notification-item` components using `@for` loop with `track notification.id`
  - Handle click events on notification items to emit `notificationClick`
  - Use OnPush change detection
  - _Requirements: 3.4, 3.5, 5.1, 5.4, 6.1_

- [ ] 8. Implement NotificationBellComponent
  - Create `src/app/shared/ui/notification-bell/notification-bell.component.ts` with standalone component
  - Inject `notificationsQuery.list()` and store in `notifications` signal
  - Create computed signals: `unreadCount()`, `badgeValue()` (shows "99+" if > 99)
  - Add template with bell icon button, PrimeNG Badge (conditional on `unreadCount() > 0`), and PrimeNG Popover
  - Implement `togglePanel(event)` method to show/hide popover using template reference
  - Add ARIA label with unread count to bell button
  - Import PrimeNG modules: `PopoverModule`, `BadgeModule`, `RippleModule`
  - Render `ui-notification-list` inside popover with notifications data
  - Use OnPush change detection
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 7.2, 8.3_

- [ ] 9. Implement notification click handler with mark-as-read mutation
  - In `NotificationBellComponent`, inject `notificationsQuery.markAsRead()` mutation
  - Implement `onNotificationClick(notification)` method to mark notification as read (if unread) and navigate to `actionUrl`
  - Add error handling with console logging for failed mutations
  - Close popover after successful click
  - _Requirements: 5.2, 5.3, 6.1_

- [ ] 10. Implement mark all as read functionality
  - In `NotificationBellComponent`, inject `notificationsQuery.markAllAsRead()` mutation
  - Implement `onMarkAllRead()` method to mark all notifications as read
  - Add error handling for failed mutations
  - _Requirements: 5.2, 5.3, 5.4_

## Integration

- [ ] 11. Update shared UI exports
  - Add `NotificationBellComponent` export to `src/app/shared/ui/index.ts`
  - Export via `./notification-bell` barrel export
  - _Requirements: 1.1_

- [ ] 12. Integrate NotificationBellComponent into TopBarComponent
  - Update `src/app/shared/ui/layout/top-bar.component.ts` imports to include `NotificationBellComponent`
  - Replace static bell icon in desktop view (lines 107-110) with `<ui-notification-bell />`
  - Replace static bell icon in mobile view (lines 65-68) with `<ui-notification-bell />`
  - Remove unused badge-related code
  - _Requirements: 1.1, 1.2, 2.1_

## Testing

- [ ] 13. Write unit tests for NotificationItemComponent
  - Test truncation at 150 characters with ellipsis
  - Test time formatting (relative for today, date for past)
  - Test unread indicator visibility
  - Test conditional styling for read/unread states
  - _Requirements: 4.3, 4.5, 4.6, 5.1_

- [ ] 14. Write unit tests for NotificationListComponent
  - Test empty state display when no notifications
  - Test rendering of notification items
  - Test "Mark all as read" button visibility based on unread status
  - Test event emissions for `notificationClick` and `markAllRead`
  - _Requirements: 3.4, 3.5, 5.4_

- [ ] 15. Write unit tests for NotificationBellComponent
  - Test badge visibility based on unread count
  - Test badge value display ("99+" for count > 99)
  - Test popover toggle on bell click
  - Test mark-as-read mutation on notification click
  - Test navigation to actionUrl after marking as read
  - Test mark all as read mutation
  - _Requirements: 1.3, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 5.2, 5.3, 6.1_

- [ ] 16. Write integration tests for notification flow
  - Test notification fetching on component initialization
  - Test badge count update after marking as read
  - Test query cache invalidation and refetch after mutations
  - Test popover close when clicking outside
  - Test error handling for API failures
  - _Requirements: 2.5, 3.2, 5.3, 7.1_

## Accessibility

- [ ] 17. Add keyboard navigation support
  - Add `(keydown.enter)` and `(keydown.space)` event handlers to bell button in `NotificationBellComponent`
  - Ensure popover can be closed with Escape key (verify PrimeNG Popover default behavior)
  - Add `tabindex="0"` to notification items for keyboard navigation
  - Test keyboard navigation flow
  - _Requirements: 8.1_

- [ ] 18. Implement ARIA live regions and labels
  - Add ARIA live region for badge count updates in `NotificationBellComponent`
  - Verify all interactive elements have appropriate ARIA labels
  - Add `aria-label` to bell button with unread count
  - Add `aria-label` to notification items with read/unread status
  - Test with screen reader
  - _Requirements: 8.3, 8.4, 8.5_

## Performance Optimization

- [ ] 19. Implement virtual scrolling for large notification lists
  - Add conditional rendering logic: if notifications count > 50, use `p-virtualScroller`
  - Import PrimeNG `VirtualScrollerModule`
  - Configure with `itemSize="72"` and `max-height: 400px`
  - Test with large dataset (100+ notifications)
  - _Requirements: 7.4_

- [ ] 20. Verify performance requirements
  - Test notification fetch and render time (should be < 1s)
  - Test popover open time (should be < 500ms)
  - Verify badge updates occur within 2s of data changes
  - Use Chrome DevTools Performance tab to measure
  - _Requirements: 7.1, 7.2, 7.3_
