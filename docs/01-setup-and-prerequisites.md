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

## Завантаження тестових конфігурацій

Оскільки для аналізу ми використовуємо набір конфігурацій з `ecc-aws-rulepack`, завантажте їх локально в папку `data`:
```bash
git clone https://github.com/epam/ecc-aws-rulepack.git data/ecc-aws-rulepack
```

## Інструменти CSPM (Потребують інсталяції)

Ці інструменти необхідно встановлювати ізольовано за допомогою `pipx`, щоб уникнути конфліктів залежностей (зокрема `boto3`).

1. **Встановлення pipx (на macOS)**:
   ```bash
   brew install pipx
   pipx ensurepath
   ```

2. **Prowler**:
   Останні версії Prowler вимагають Python < 3.13. Щоб уникнути помилок із залежностями (наприклад, `pydantic ConfigError`) на новіших версіях Python (3.13+), встановіть Python 3.12 та примусово вкажіть `pipx` використовувати його:
   ```bash
   brew install python@3.12
   pipx uninstall prowler  # на випадок якщо він вже був встановлений з помилками
   pipx install --python $(brew --prefix python@3.12)/bin/python3.12 prowler
   ```


3. **AWS Security Hub**: Повинен бути активований в цільовому AWS акаунті.
   - Для цілей цього дослідження необхідно обов'язково увімкнути стандарт безпеки **NIST Special Publication 800-53 Revision 5**.
   - Перейдіть за посиланням: [Security Hub Standards (us-east-1)](https://us-east-1.console.aws.amazon.com/securityhub/home?region=us-east-1#/standards)
   - Знайдіть на сторінці **NIST Special Publication 800-53 Revision 5** та натисніть кнопку **Enable Standard**.

## Налаштування AWS доступу

Для запуску конфігурацій Terraform та CSPM інструментів необхідно налаштувати доступ до AWS з правами адміністратора, а також окремого аудитора для CSPM інструментів.

1. Увійдіть до консолі AWS (сервіс **IAM**).
2. **Користувач для Terraform (Адміністратор)**:
   - Створіть нову групу з назвою `Terraform` (або подібною).
   - Додайте до цієї групи політику (policy) `AdministratorAccess`.
   - Створіть нового користувача (наприклад, `terraform`) та додайте його до створеної групи.
   - Згенеруйте для цього користувача **AWS Access Key** та **Secret Access Key**.
3. **Користувач для CSPM (Аудитор)**:
   Для повноцінної роботи CSPM-інструментів (зокрема, Prowler) самої ролі SecurityAudit недостатньо. Виконайте наступні кроки:
   - Створіть нову групу з назвою `Auditors` (або подібною).
   - Додайте до цієї групи наступні стандартні (AWS managed) політики:
     - `arn:aws:iam::aws:policy/SecurityAudit`
     - `arn:aws:iam::aws:policy/job-function/ViewOnlyAccess`
   - Створіть кастомну політику (Customer managed policy) з назвою `ProwlerAdditionsPolicy`:
     - Скопіюйте JSON-файл політики з офіційного репозиторію Prowler: [prowler-additions-policy.json](https://raw.githubusercontent.com/prowler-cloud/prowler/master/permissions/prowler-additions-policy.json).
     - При створенні політики в консолі AWS IAM оберіть вкладку **JSON** та вставте вміст файлу.
   - Додайте новостворену кастомну політику `ProwlerAdditionsPolicy` до групи `Auditors`.
   - Створіть нового користувача `auditor` та додайте його до групи `Auditors`.
   - Згенеруйте для цього користувача **AWS Access Key** та **Secret Access Key**.
4. Локально в терміналі виконайте команду налаштування, вказавши профіль `c7n` для адміністратора (оскільки репозиторій `epam/ecc-aws-rulepack` очікує саме цей профіль):

   ```bash
   aws configure --profile c7n
   ```

   При запиті введіть дані користувача `terraform` (Administrator):
   - **AWS Access Key ID**: `[Згенерований ключ terraform]`
   - **AWS Secret Access Key**: `[Секретний ключ terraform]`
   - **Default region name**: `us-east-1` (обов'язково для сумісності з `ecc-aws-rulepack`)
   - **Default output format**: `json`

5. Налаштуйте профіль для аудитора (CSPM інструменти можуть використовувати його за потреби):
   ```bash
   aws configure --profile auditor
   ```
   Введіть дані користувача `auditor` (SecurityAuditor).

6. Після налаштування, для того щоб пайплайн (Terraform) за замовчуванням використовував профіль адміністратора, виконайте:
   ```bash
   export AWS_PROFILE=c7n
   ```

## Налаштування OpenRouter

Для доступу до LLM (OpenRouter) потрібно встановити змінну середовища з вашим ключем:
```bash
export OPENROUTER_API_KEY="your_api_key_here"
```

## Опціонально: Генерація архітектурних діаграм

Ці кроки є необов'язковими, але дозволяють відслідкувати хід створення референсної архітектури для проєкту.

1. **Встановлення kiro-cli**:
   Відповідно до офіційної інструкції [kiro.dev/docs/cli](https://kiro.dev/docs/cli/), встановіть `kiro-cli`.
2. **Аутентифікація**:
   Виконайте `kiro-cli login`, обравши `AWS Builder ID` як спосіб логіну, та використайте зручний для вас метод.
3. **Встановлення uv**:
   ```bash
   pipx install uv
   ```
4. **Налаштування AWS Diagram MCP/Skills**:
   Виконайте Quick Setup, описаний у [цій статті на AWS Builder](https://builder.aws.com/content/3Dd4PzYvNS7knkGhX5qNvtkcbkf/the-aws-diagram-mcp-server-was-deprecated-heres-the-updated-approach-using-agent-skills).
5. **Генерація та збереження діаграми**:
   Після успішної інсталяції та запуску `kiro-cli`, був запущений промпт (знаходиться в `docs/prompts/`) на створення архітектурної діаграми. 
   Отриману діаграму було додатково відредаговано для кращого компанування у сервісі [app.diagrams.net](https://app.diagrams.net/) та збережено в папку `docs/diagrams/`.
