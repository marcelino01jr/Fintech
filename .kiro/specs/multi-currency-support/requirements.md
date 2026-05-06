# Requirements Document

## Introduction

This feature adds multi-currency support to the personal finance tracker application. Currently, all monetary values are hardcoded to Indonesian Rupiah (IDR). Users who live abroad or move between countries need the ability to record transactions in different currencies while viewing summaries in their preferred currency. The system will store currency per transaction to preserve historical accuracy, allow users to set a preferred display currency, and optionally convert cross-currency totals using exchange rates.

## Glossary

- **Finance_Tracker**: The personal finance tracking web application (Next.js + Drizzle ORM + CockroachDB)
- **User**: An authenticated person using the Finance_Tracker to manage personal finances
- **Preferred_Currency**: The currency a User selects as their default for display and new transactions
- **Transaction_Currency**: The ISO 4217 currency code stored with each individual transaction at the time of recording
- **Currency_Formatter**: The utility module responsible for formatting monetary values with the correct locale and currency symbol
- **Currency_Selector**: A UI dropdown component that allows selection of a currency from the supported list
- **Exchange_Rate_Service**: An external API or data source providing currency conversion rates
- **Dashboard_Summary**: The aggregated financial overview (income, expense, balance) shown on the dashboard page
- **Supported_Currencies**: The set of ISO 4217 currency codes available for selection (e.g., IDR, CNY, JPY, USD, EUR, SGD, MYR, THB, KRW, GBP, AUD)

## Requirements

### Requirement 1: User Preferred Currency Setting

**User Story:** As a User, I want to set my preferred currency, so that all monetary displays default to my chosen currency when I move to a different country.

#### Acceptance Criteria

1. THE Finance_Tracker SHALL store a `preferredCurrency` field on the users table with a default value of "IDR"
2. WHEN a User navigates to the Profile page, THE Finance_Tracker SHALL display a Currency_Selector showing the current Preferred_Currency
3. WHEN a User selects a new currency from the Currency_Selector and saves, THE Finance_Tracker SHALL update the User's Preferred_Currency in the database
4. WHEN a User changes their Preferred_Currency, THE Finance_Tracker SHALL use the new Preferred_Currency for all subsequent display formatting without altering existing transaction data
5. IF the Preferred_Currency value is missing or invalid, THEN THE Finance_Tracker SHALL fall back to "IDR" as the default currency

### Requirement 2: Per-Transaction Currency Storage

**User Story:** As a User, I want each transaction to record the currency it was made in, so that historical data remains accurate regardless of future currency preference changes.

#### Acceptance Criteria

1. THE Finance_Tracker SHALL store a `currency` field (ISO 4217 code) on each transaction record
2. WHEN a User creates a new transaction, THE Finance_Tracker SHALL default the transaction currency to the User's current Preferred_Currency
3. WHEN a User creates a new transaction, THE Finance_Tracker SHALL display a Currency_Selector allowing the User to override the default currency
4. THE Finance_Tracker SHALL preserve the original Transaction_Currency for all existing and future transactions regardless of changes to the User's Preferred_Currency
5. WHEN a User edits an existing transaction, THE Finance_Tracker SHALL display the transaction's stored currency in the Currency_Selector

### Requirement 3: Dynamic Currency Formatting

**User Story:** As a User, I want monetary values displayed with the correct currency symbol and formatting, so that I can clearly identify amounts in different currencies.

#### Acceptance Criteria

1. THE Currency_Formatter SHALL accept a currency code parameter and format the value using the appropriate locale and symbol for that currency
2. WHEN displaying a transaction amount in a list or detail view, THE Currency_Formatter SHALL use the Transaction_Currency stored on that transaction
3. WHEN displaying aggregated totals on the Dashboard_Summary, THE Currency_Formatter SHALL use the User's Preferred_Currency
4. THE Currency_Formatter SHALL use `Intl.NumberFormat` with the correct ISO 4217 currency code and appropriate locale mapping
5. IF an unsupported currency code is provided, THEN THE Currency_Formatter SHALL fall back to formatting with "IDR"

### Requirement 4: Dashboard Summary with Preferred Currency

**User Story:** As a User, I want my dashboard summary totals shown in my preferred currency, so that I can understand my overall financial position in a single currency.

#### Acceptance Criteria

1. WHEN all transactions in the selected month share the same currency as the User's Preferred_Currency, THE Dashboard_Summary SHALL display totals directly without conversion
2. WHEN transactions in the selected month contain mixed currencies, THE Dashboard_Summary SHALL display totals converted to the User's Preferred_Currency
3. WHEN displaying converted totals, THE Dashboard_Summary SHALL show an indicator that conversion has been applied
4. IF the Exchange_Rate_Service is unavailable, THEN THE Dashboard_Summary SHALL display totals grouped by currency without conversion and show a notice that rates are unavailable
5. THE Dashboard_Summary SHALL display the currency code alongside each total value

### Requirement 5: Exchange Rate Integration

**User Story:** As a User, I want automatic currency conversion for mixed-currency summaries, so that I can see meaningful totals without manual calculation.

#### Acceptance Criteria

1. THE Finance_Tracker SHALL retrieve exchange rates from an Exchange_Rate_Service for converting between Supported_Currencies
2. THE Finance_Tracker SHALL cache exchange rates for a minimum of 1 hour to reduce external API calls
3. WHEN converting an amount, THE Finance_Tracker SHALL use the most recently cached rate for the source and target currency pair
4. IF the Exchange_Rate_Service returns an error or is unreachable, THEN THE Finance_Tracker SHALL use the last successfully cached rates if available
5. IF no cached rates exist and the Exchange_Rate_Service is unavailable, THEN THE Finance_Tracker SHALL skip conversion and display amounts in their original currencies with a user-visible notice
6. THE Finance_Tracker SHALL log exchange rate fetch failures for debugging purposes

### Requirement 6: Currency Selector Component

**User Story:** As a User, I want a clear and accessible currency selector, so that I can easily choose currencies when setting preferences or recording transactions.

#### Acceptance Criteria

1. THE Currency_Selector SHALL display each currency with its ISO 4217 code and full name (e.g., "CNY - Chinese Yuan")
2. THE Currency_Selector SHALL support the full list of Supported_Currencies defined in the Glossary
3. THE Currency_Selector SHALL visually indicate the currently selected currency
4. WHEN the Currency_Selector is used in the transaction form, THE Currency_Selector SHALL default to the User's Preferred_Currency for new transactions
5. THE Currency_Selector SHALL be keyboard-accessible and follow WCAG 2.1 AA guidelines

### Requirement 7: Database Migration Safety

**User Story:** As a User, I want the currency migration to preserve all my existing data, so that I do not lose any transaction history during the upgrade.

#### Acceptance Criteria

1. WHEN the migration adds the `currency` column to the transactions table, THE Finance_Tracker SHALL set the default value to "IDR" for all existing records
2. WHEN the migration adds the `preferredCurrency` column to the users table, THE Finance_Tracker SHALL set the default value to "IDR" for all existing records
3. THE Finance_Tracker SHALL execute the migration as a non-destructive, additive schema change with no data loss
4. IF the migration fails, THEN THE Finance_Tracker SHALL roll back all schema changes and leave existing data intact
