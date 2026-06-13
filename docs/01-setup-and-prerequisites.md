# Налаштування середовища та передумови

Цей документ описує необхідні кроки для налаштування середовища перед запуском пайплайну.

## Передумови (Prerequisites)

1. **AWS CLI v2**: Встановлено та налаштовано AWS профіль (`aws configure`).
2. **Terraform**: Версія >= 1.0. Встановлено локально.
3. **Python 3.10+**: Для запуску автоматизації пайплайну.
   Створіть та активуйте віртуальне середовище перед роботою з Python скриптами:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r pipeline/requirements.txt -r analysis/requirements.txt
   ```
4. **Node.js**: Для запуску React презентації.

## Інструменти CSPM (Потребують інсталяції)

Ці інструменти необхідно встановлювати ізольовано за допомогою `pipx`, щоб уникнути конфліктів залежностей (зокрема `boto3`).

1. **Встановлення pipx (на macOS)**:
   ```bash
   brew install pipx
   pipx ensurepath
   ```

2. **Prowler**:
   ```bash
   pipx install prowler
   ```

3. **Cloud Custodian**:
   ```bash
   pipx install c7n
   ```

4. **AWS Security Hub**: Повинен бути активований в цільовому AWS акаунті.

## Налаштування AWS доступу

Для запуску конфігурацій Terraform та CSPM інструментів необхідно налаштувати доступ до AWS з правами адміністратора.

1. Увійдіть до консолі AWS (сервіс **IAM**).
2. Створіть нову групу з назвою `Terraform` (або подібною).
3. Додайте до цієї групи політику (policy) `AdministratorAccess`.
4. Створіть нового користувача (наприклад, `terraform`) та додайте його до створеної групи.
5. Для цього користувача згенеруйте **AWS Access Key** та **Secret Access Key**.
6. Локально в терміналі виконайте команду налаштування, вказавши профіль `c7n` (оскільки репозиторій `epam/ecc-aws-rulepack` очікує саме цей профіль та регіон):

   ```bash
   aws configure --profile c7n
   ```

   При запиті введіть ваші дані:
   - **AWS Access Key ID**: `[Ваш згенерований ключ]`
   - **AWS Secret Access Key**: `[Ваш секретний ключ]`
   - **Default region name**: `us-east-1` (обов'язково для сумісності з `ecc-aws-rulepack`)
   - **Default output format**: `json`

7. Після налаштування, для того щоб пайплайн та інструменти автоматично використовували цей профіль, виконайте:
   ```bash
   export AWS_PROFILE=c7n
   ```

## Налаштування OpenRouter

Для доступу до LLM (OpenRouter) потрібно встановити змінну середовища з вашим ключем:
```bash
export OPENROUTER_API_KEY="your_api_key_here"
```
