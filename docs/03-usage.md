# Довідник користувача (User Guide)

Цей документ описує, як використовувати консольний інтерфейс пайплайну `pipeline/main.py` для управління процесом тестування.

## Конфігурація сценаріїв (`scenarios.yaml`)

Пайплайн працює на основі "сценаріїв". Сценарій — це логічна група Terraform-конфігурацій. Ви можете редагувати файл `pipeline/scenarios.yaml`, додаючи туди потрібні правила. 
Наприклад:
```yaml
scenarios:
  - name: test_s3_red
    type: red
    rules:
      - ecc-aws-004-bucket_policy_allows_https_requests
      - ecc-aws-042-s3_encrypted_using_kms
```

## Доступні команди

Всі команди виконуються з папки `pipeline/`:
```bash
cd pipeline
source .venv/bin/activate
```

### Запуск всього пайплайну
Найбільш вживана команда. Вона автоматично підніме інфраструктуру, запустить CSPM-інструменти, виконає LLM-аналіз і **гарантовано** знищить створені ресурси в кінці (навіть у разі помилки).
```bash
python main.py run-all --scenario test_s3_red
```

### Покроковий запуск (для розробки та налагодження)

Якщо ви хочете виконати етапи окремо:

**1. Terraform Apply**
Піднімає інфраструктуру згідно зі сценарієм.
```bash
python main.py apply --scenario test_s3_red
```

**2. CSPM Аналіз**
Запускає Prowler та Cloud Custodian на розгорнутих ресурсах і зберігає логи в JSON/CSV форматах.
```bash
python main.py cspm --scenario test_s3_red
```

**3. LLM Аналіз**
Обробляє звіти CSPM через OpenRouter для виявлення False Positives та валідації компенсуючих заходів.
```bash
python main.py analyze --scenario test_s3_red
```

**4. Terraform Destroy**
Знищує всі розгорнуті ресурси згідно зі сценарієм. 
> [!WARNING]
> Важливо не забувати цей крок при покроковому запуску, щоб уникнути зайвих витрат в AWS!
```bash
python main.py destroy --scenario test_s3_red
```

### Глобальні параметри
Ви можете змінити шлях до файлу сценаріїв або шлях до репозиторію `ecc-aws-rulepack` за допомогою глобальних прапорців (встановлюються ДО підкоманди):
```bash
python main.py --scenarios-file custom_scenarios.yaml --base-path /tmp/repo apply --scenario custom_test
```
