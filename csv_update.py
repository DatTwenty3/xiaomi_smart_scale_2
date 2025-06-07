import csv
import os
from datetime import datetime
import pandas as pd
from typing import Dict, Any, Optional, List, Tuple
import logging
from pathlib import Path

# Configure logging
logger = logging.getLogger(__name__)

# Configuration
CSV_CONFIG = {
    'file_path': 'user_data/user_data.csv',
    'encoding': 'utf-8-sig',  # Better for Vietnamese text
    'date_format': "%d/%m/%Y %H:%M"
}

# Define CSV headers and their corresponding data mapping
CSV_HEADERS = {
    # Basic info
    'datetime': None,  # Will be auto-generated
    'name': 'name',
    'age': 'age',
    'gender': 'gender',
    'height': 'height',
    'weight': 'weight',
    'dob': 'dob',
    'cccd_id': 'cccd_id',
    'address': 'address',
    'activity_factor': 'activity_factor',

    # Body composition measurements
    'bmi': 'bmi',
    'bmr': 'bmr',
    'tdee': 'tdee',
    'lean_body_mass': 'lbm',
    'fat_percentage': 'fp',
    'water_percentage': 'wp',
    'bone_mass': 'bm',
    'muscle_mass': 'ms',
    'protein_percentage': 'pp',
    'visceral_fat': 'vf',
    'ideal_weight': 'iw',
    'oneleg_standing': 'ols'
}


class CSVDataManager:
    """Enhanced CSV data management class with better error handling and validation"""

    def __init__(self, config: Dict[str, Any] = None):
        """Initialize the CSV manager with configuration"""
        self.config = config or CSV_CONFIG
        self.headers = CSV_HEADERS
        self.file_path = Path(self.config['file_path'])

    def get_safe_value(self, data: Dict[str, Any], key: str, default: Any = '') -> Any:
        """
        Safely get value from dictionary with fallback to default

        Args:
            data: Dictionary to get value from
            key: Key to look for
            default: Default value if key not found

        Returns:
            Value from dictionary or default
        """
        try:
            return data.get(key, default) if data else default
        except (AttributeError, TypeError):
            logger.warning(f"Invalid data type for key '{key}', using default: {default}")
            return default

    def format_datetime(self) -> str:
        """Generate formatted datetime string"""
        return datetime.now().strftime(self.config['date_format'])

    def prepare_csv_row(self, user_info: Dict[str, Any], measurements: Dict[str, Any]) -> List[Any]:
        """
        Prepare CSV row data from user info and measurements

        Args:
            user_info: Dictionary containing user information
            measurements: Dictionary containing body composition measurements

        Returns:
            List of values for CSV row
        """
        # Combine user_info and measurements for easier access
        combined_data = {**(user_info or {}), **(measurements or {})}

        row_data = []

        for header, data_key in self.headers.items():
            if header == 'datetime':
                # Auto-generate datetime
                row_data.append(self.format_datetime())
            elif data_key is None:
                # Skip fields with no mapping
                row_data.append('')
            else:
                # Get value from combined data
                value = self.get_safe_value(combined_data, data_key, '')

                # Format specific data types
                if isinstance(value, float):
                    value = round(value, 2)  # Round floats to 2 decimal places
                elif value is None:
                    value = ''

                row_data.append(str(value))  # Ensure all values are strings

        return row_data

    def ensure_directory_exists(self) -> None:
        """Ensure the directory for the file exists"""
        self.file_path.parent.mkdir(parents = True, exist_ok = True)
        if not self.file_path.parent.exists():
            logger.info(f"Created directory: {self.file_path.parent}")

    def validate_data(self, user_info: Dict[str, Any], measurements: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """
        Validate input data before writing to CSV

        Args:
            user_info: User information dictionary
            measurements: Measurements dictionary

        Returns:
            Tuple of (is_valid, list_of_errors)
        """
        errors = []

        # Debug logging
        logger.debug(f"Validating user_info: {user_info}")
        logger.debug(f"Validating measurements: {measurements}")

        # Check if inputs are dictionaries
        if user_info is None:
            errors.append("user_info cannot be None")
        elif not isinstance(user_info, dict):
            errors.append(f"user_info must be a dictionary, got {type(user_info)}")

        if measurements is None:
            errors.append("measurements cannot be None")
        elif not isinstance(measurements, dict):
            errors.append(f"measurements must be a dictionary, got {type(measurements)}")

        if errors:
            logger.error(f"Type validation errors: {errors}")
            return False, errors

        # Check required fields - only 'name' is truly required
        name = self.get_safe_value(user_info, 'name', '').strip()
        if not name:
            errors.append("Missing required field: name (cannot be empty)")

        # Validate optional numeric fields if provided
        numeric_validations = [
            ('height', user_info, 1, 300, "cm"),
            ('weight', user_info, 1, 500, "kg"),
            ('age', measurements, 1, 150, "years"),
            ('activity_factor', user_info, 0.5, 3.0, ""),
        ]

        for field_name, data_dict, min_val, max_val, unit in numeric_validations:
            value = self.get_safe_value(data_dict, field_name, None)
            if value is not None and value != '':
                try:
                    num_value = float(value)
                    if num_value < min_val or num_value > max_val:
                        errors.append(f"Invalid {field_name}: {value} (must be between {min_val}-{max_val} {unit})")
                except (ValueError, TypeError):
                    errors.append(f"Invalid {field_name}: '{value}' is not a valid number")

        # Validate percentage fields (0-100)
        percentage_fields = ['fp', 'wp', 'pp']  # fat%, water%, protein%
        for field in percentage_fields:
            value = self.get_safe_value(measurements, field, None)
            if value is not None and value != '':
                try:
                    num_value = float(value)
                    if num_value < 0 or num_value > 100:
                        errors.append(f"Invalid {field}: {value} (percentage must be between 0-100)")
                except (ValueError, TypeError):
                    errors.append(f"Invalid {field}: '{value}' is not a valid percentage")

        # Validate gender if provided
        gender = self.get_safe_value(measurements, 'gender', self.get_safe_value(user_info, 'gender', ''))
        if gender and gender.lower() not in ['nam', 'nữ', 'male', 'female', 'm', 'f']:
            errors.append(f"Invalid gender: '{gender}' (must be 'Nam', 'Nữ', 'Male', 'Female', 'M', or 'F')")

        # Log validation results
        if errors:
            logger.error(f"Validation failed with errors: {errors}")
        else:
            logger.debug("Data validation passed")

        return len(errors) == 0, errors

    def backup_csv_file(self) -> Optional[Path]:
        """
        Create a backup of the CSV file

        Returns:
            Path to backup file or None if backup failed
        """
        if not self.file_path.exists():
            return None

        try:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_path = self.file_path.with_suffix(f'.backup_{timestamp}.csv')

            # Copy file with proper encoding
            with open(self.file_path, 'r', encoding = self.config['encoding']) as src:
                with open(backup_path, 'w', encoding = self.config['encoding'], newline = '') as dst:
                    dst.write(src.read())

            logger.info(f"Backup created: {backup_path}")
            return backup_path

        except Exception as e:
            logger.error(f"Failed to create backup: {e}")
            return None

    def file_exists_and_has_content(self) -> bool:
        """Check if CSV file exists and has content"""
        return self.file_path.exists() and self.file_path.stat().st_size > 0

    def update_csv(self, user_info: Dict[str, Any], measurements: Dict[str, Any],
                   create_backup: bool = False) -> Tuple[bool, List[str]]:
        """
        Update CSV file with user information and measurements

        Args:
            user_info: Dictionary containing user information
            measurements: Dictionary containing body composition measurements
            create_backup: Whether to create backup before updating

        Returns:
            Tuple of (success, list_of_messages)
        """
        messages = []

        try:
            # Validate input data
            is_valid, validation_errors = self.validate_data(user_info, measurements)
            if not is_valid:
                logger.error("Data validation failed")
                return False, validation_errors

            # Ensure directory exists
            self.ensure_directory_exists()

            # Create backup if requested and file exists
            if create_backup and self.file_exists_and_has_content():
                backup_path = self.backup_csv_file()
                if backup_path:
                    messages.append(f"Backup created: {backup_path.name}")

            # Check if file exists and has headers
            file_needs_headers = not self.file_exists_and_has_content()

            # Prepare row data
            row_data = self.prepare_csv_row(user_info, measurements)

            # Write to CSV
            with open(self.file_path, mode = 'a', newline = '', encoding = self.config['encoding']) as file:
                writer = csv.writer(file)

                # Write headers if file is new or empty
                if file_needs_headers:
                    headers = list(self.headers.keys())
                    writer.writerow(headers)
                    logger.info("CSV headers written")
                    messages.append("CSV headers initialized")

                # Write data row
                writer.writerow(row_data)

            logger.info(f"Data successfully written to {self.file_path}")
            messages.append(f"Data successfully saved to {self.file_path.name}")
            print('✓ Đã cập nhật vào file CSV thành công!')
            return True, messages

        except Exception as e:
            error_msg = f"Error updating CSV: {e}"
            logger.error(error_msg)
            print(f'✗ Lỗi khi cập nhật CSV: {e}')
            return False, [error_msg]

    def read_csv_data(self, fix_corrupted: bool = True) -> pd.DataFrame:
        """
        Read CSV data as pandas DataFrame with error handling

        Args:
            fix_corrupted: Whether to attempt fixing corrupted CSV

        Returns:
            pandas DataFrame with CSV data
        """
        if not self.file_path.exists():
            logger.warning(f"CSV file not found: {self.file_path}")
            return pd.DataFrame()

        try:
            # First attempt: Normal read
            df = pd.read_csv(self.file_path, encoding = self.config['encoding'])
            logger.info(f"Successfully read {len(df)} records from {self.file_path}")
            return df

        except pd.errors.ParserError as e:
            logger.warning(f"CSV parsing error: {e}")

            if fix_corrupted:
                logger.info("Attempting to fix corrupted CSV...")
                return self.fix_csv_file()
            else:
                return pd.DataFrame()

        except Exception as e:
            logger.error(f"Error reading CSV: {e}")
            return pd.DataFrame()

    def fix_csv_file(self) -> pd.DataFrame:
        """
        Attempt to fix corrupted CSV file by reading line by line

        Returns:
            pandas DataFrame with recoverable data
        """
        logger.info(f"Attempting to fix corrupted CSV: {self.file_path}")

        try:
            # Get expected headers
            expected_headers = list(self.headers.keys())
            expected_cols = len(expected_headers)

            fixed_rows = []
            corrupted_lines = []

            with open(self.file_path, 'r', encoding = self.config['encoding']) as file:
                reader = csv.reader(file)

                for line_num, row in enumerate(reader, 1):
                    if line_num == 1:
                        # Header row
                        if len(row) == expected_cols:
                            headers = row
                        else:
                            logger.warning(f"Header mismatch. Expected {expected_cols}, got {len(row)}")
                            headers = expected_headers
                        continue

                    # Data rows
                    if len(row) == expected_cols:
                        fixed_rows.append(row)
                    elif len(row) > expected_cols:
                        # Too many columns - truncate
                        logger.warning(f"Line {line_num}: Too many fields ({len(row)}), truncating to {expected_cols}")
                        fixed_rows.append(row[:expected_cols])
                        corrupted_lines.append(line_num)
                    elif len(row) < expected_cols and len(row) > 0:
                        # Too few columns - pad with empty strings
                        logger.warning(f"Line {line_num}: Too few fields ({len(row)}), padding to {expected_cols}")
                        padded_row = row + [''] * (expected_cols - len(row))
                        fixed_rows.append(padded_row)
                        corrupted_lines.append(line_num)
                    # Skip completely empty rows

            if corrupted_lines:
                logger.info(f"Fixed {len(corrupted_lines)} corrupted lines: {corrupted_lines}")

                # Create backup of original corrupted file
                backup_path = self.file_path.with_suffix(
                    f'.corrupted_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv')
                self.file_path.rename(backup_path)
                logger.info(f"Original corrupted file backed up to: {backup_path}")

                # Write fixed data back to original file
                with open(self.file_path, 'w', newline = '', encoding = self.config['encoding']) as file:
                    writer = csv.writer(file)
                    writer.writerow(expected_headers)
                    writer.writerows(fixed_rows)

                logger.info(f"Fixed CSV file written with {len(fixed_rows)} valid records")

            # Create DataFrame from fixed data
            if fixed_rows:
                df = pd.DataFrame(fixed_rows, columns = expected_headers)
                logger.info(f"Successfully recovered {len(df)} records")
                return df
            else:
                logger.warning("No valid data found in CSV file")
                return pd.DataFrame()

        except Exception as e:
            logger.error(f"Failed to fix CSV file: {e}")
            return pd.DataFrame()

    def validate_csv_structure(self) -> Dict[str, Any]:
        """
        Validate CSV file structure and report issues

        Returns:
            Dictionary with validation results
        """
        result = {
            'is_valid': False,
            'file_exists': self.file_path.exists(),
            'total_lines': 0,
            'valid_lines': 0,
            'corrupted_lines': [],
            'missing_headers': [],
            'extra_headers': []
        }

        if not self.file_path.exists():
            result['error'] = 'File not found'
            return result

        try:
            expected_headers = list(self.headers.keys())
            expected_cols = len(expected_headers)

            with open(self.file_path, 'r', encoding = self.config['encoding']) as file:
                reader = csv.reader(file)

                for line_num, row in enumerate(reader, 1):
                    result['total_lines'] += 1

                    if line_num == 1:
                        # Check headers
                        if len(row) != expected_cols:
                            result['header_mismatch'] = f"Expected {expected_cols} headers, got {len(row)}"

                        missing = set(expected_headers) - set(row)
                        extra = set(row) - set(expected_headers)
                        result['missing_headers'] = list(missing)
                        result['extra_headers'] = list(extra)
                        continue

                    # Check data rows
                    if len(row) == expected_cols:
                        result['valid_lines'] += 1
                    else:
                        result['corrupted_lines'].append({
                            'line': line_num,
                            'expected': expected_cols,
                            'actual': len(row)
                        })

            result['is_valid'] = (len(result['corrupted_lines']) == 0 and
                                  len(result['missing_headers']) == 0 and
                                  result['total_lines'] > 0)

        except Exception as e:
            result['error'] = str(e)

        return result

    def get_user_history(self, name: str, limit: Optional[int] = None) -> pd.DataFrame:
        """
        Get measurement history for a specific user

        Args:
            name: User's name
            limit: Maximum number of records to return (optional)

        Returns:
            DataFrame with user's measurement history
        """
        df = self.read_csv_data()

        if df.empty:
            return df

        # Filter by user name (case-insensitive)
        user_data = df[df['name'].str.lower() == name.lower()].copy()

        if not user_data.empty:
            # Sort by datetime (most recent first)
            try:
                user_data['datetime'] = pd.to_datetime(user_data['datetime'], format = self.config['date_format'])
                user_data = user_data.sort_values('datetime', ascending = False)
            except Exception as e:
                logger.warning(f"Could not parse datetime column: {e}")

            if limit and limit > 0:
                user_data = user_data.head(limit)

        logger.info(f"Retrieved {len(user_data)} records for user: {name}")
        return user_data

    def get_statistics(self) -> Dict[str, Any]:
        """Get basic statistics about the CSV data"""
        df = self.read_csv_data()

        if df.empty:
            return {'total_records': 0, 'unique_users': 0, 'date_range': None}

        stats = {
            'total_records': len(df),
            'unique_users': df['name'].nunique() if 'name' in df.columns else 0,
            'columns': list(df.columns),
            'date_range': None
        }

        # Try to get date range
        if 'datetime' in df.columns:
            try:
                df['parsed_datetime'] = pd.to_datetime(df['datetime'], format = self.config['date_format'])
                stats['date_range'] = {
                    'earliest': df['parsed_datetime'].min().strftime(self.config['date_format']),
                    'latest': df['parsed_datetime'].max().strftime(self.config['date_format'])
                }
            except Exception as e:
                logger.warning(f"Could not parse date range: {e}")

        return stats


# Convenience functions for backward compatibility
def update_csv(user_info: Dict[str, Any], measurements: Dict[str, Any], create_backup: bool = False) -> bool:
    """Convenience function for updating CSV - maintains backward compatibility"""
    manager = CSVDataManager()
    success, messages = manager.update_csv(user_info, measurements, create_backup)
    return success


def read_csv_data(file_path: Optional[str] = None, fix_corrupted: bool = True) -> pd.DataFrame:
    """Convenience function for reading CSV - maintains backward compatibility"""
    config = CSV_CONFIG.copy()
    if file_path:
        config['file_path'] = file_path
    manager = CSVDataManager(config)
    return manager.read_csv_data(fix_corrupted)


def get_user_history(name: str, limit: Optional[int] = None) -> pd.DataFrame:
    """Convenience function for getting user history - maintains backward compatibility"""
    manager = CSVDataManager()
    return manager.get_user_history(name, limit)


# Example usage and testing
if __name__ == "__main__":
    # Configure logging for testing
    logging.basicConfig(level = logging.DEBUG, format = '%(levelname)s: %(message)s')

    # Create manager instance
    csv_manager = CSVDataManager()

    # Test data
    user_info_example = {
        'name': 'Lê Đạt',
        'dob': '23/09/1999',
        'gender': 'Nam',
        'cccd_id': '084099010894',
        'address': 'Số 767, Khóm 3, Phường 7, Thành phố Trà Vinh, Trà Vinh',
        'height': 170,
        'weight': 65.5,
        'activity_factor': 1.55
    }

    measurements_example = {
        'age': 25,
        'gender': 'Nam',
        'bmi': 22.7,
        'bmr': 1650,
        'tdee': 2557,
        'lbm': 55.2,
        'fp': 15.8,
        'wp': 58.5,
        'bm': 3.2,
        'ms': 52.0,
        'pp': 18.5,
        'vf': 8,
        'iw': 65.0,
        'ols': 45.2
    }

    print("=" * 60)
    print("TESTING IMPROVED CSV MANAGEMENT SYSTEM")
    print("=" * 60)

    # Test 1: Validate CSV structure
    print("\n1. Validating CSV structure...")
    validation = csv_manager.validate_csv_structure()
    print(f"   File exists: {validation['file_exists']}")
    print(f"   Total lines: {validation['total_lines']}")
    print(f"   Valid lines: {validation['valid_lines']}")
    print(f"   Corrupted lines: {len(validation['corrupted_lines'])}")
    print(f"   Is valid: {validation['is_valid']}")

    # Test 2: Update CSV
    print("\n2. Testing CSV update...")
    success, messages = csv_manager.update_csv(user_info_example, measurements_example, create_backup = True)

    if success:
        print("   ✓ Update successful!")
        for msg in messages:
            print(f"   - {msg}")
    else:
        print("   ✗ Update failed!")
        for msg in messages:
            print(f"   - {msg}")

    # Test 3: Read data and statistics
    print("\n3. Reading data and statistics...")
    df = csv_manager.read_csv_data()
    if not df.empty:
        print(f"   ✓ Read {len(df)} records")

        stats = csv_manager.get_statistics()
        print(f"   Statistics:")
        print(f"   - Total records: {stats['total_records']}")
        print(f"   - Unique users: {stats['unique_users']}")
        if stats['date_range']:
            print(f"   - Date range: {stats['date_range']['earliest']} to {stats['date_range']['latest']}")
    else:
        print("   ✗ No data found")

    # Test 4: User history
    print(f"\n4. Testing user history for '{user_info_example['name']}'...")
    history = csv_manager.get_user_history(user_info_example['name'], limit = 5)
    if not history.empty:
        print(f"   ✓ Found {len(history)} records")
        for idx, row in history.head(3).iterrows():
            datetime_str = row.get('datetime', 'N/A')
            weight = row.get('weight', 'N/A')
            print(f"   - {datetime_str}: Weight={weight}kg")
    else:
        print("   ℹ️  No history found")

    # Test 5: Error handling
    print("\n5. Testing error handling...")

    # Test with invalid data
    print("   Testing with empty name...")
    invalid_data = {'name': ''}  # Missing required name
    success, errors = csv_manager.update_csv(invalid_data, {})
    if not success:
        print("   ✓ Correctly rejected invalid data:")
        for error in errors:
            print(f"     - {error}")
    else:
        print("   ✗ Should have rejected empty name")

    # Test with invalid numeric values
    print("   Testing with invalid height...")
    invalid_numeric = {'name': 'Test User', 'height': 'invalid_height'}
    success, errors = csv_manager.update_csv(invalid_numeric, {})
    if not success:
        print("   ✓ Correctly rejected invalid numeric data:")
        for error in errors:
            print(f"     - {error}")
    else:
        print("   ✗ Should have rejected invalid height")

    # Test with valid minimal data
    print("   Testing with minimal valid data...")
    minimal_data = {'name': 'Test Minimal User'}
    success, messages = csv_manager.update_csv(minimal_data, {})
    if success:
        print("   ✓ Accepted minimal valid data")
        for msg in messages:
            print(f"     - {msg}")
    else:
        print("   ✗ Should have accepted minimal data:")
        for msg in messages:
            print(f"     - {msg}")

    # Test 6: Debug the original data that failed
    print("\n6. Testing original data structure...")
    print("   Validating user_info_example...")
    is_valid, validation_errors = csv_manager.validate_data(user_info_example, measurements_example)
    if is_valid:
        print("   ✓ Original data is valid")
    else:
        print("   ✗ Original data validation failed:")
        for error in validation_errors:
            print(f"     - {error}")

    print("\n" + "=" * 60)
    print("IMPROVED TEST COMPLETED")
    print("=" * 60)