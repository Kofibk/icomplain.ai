// UK Finance Providers & Lenders Database
// Used for autocomplete in questionnaire

export const UK_CAR_FINANCE_LENDERS = [
  // Major Banks
  'Barclays Partner Finance',
  'Lloyds Bank',
  'HSBC',
  'NatWest',
  'Santander Consumer Finance',
  'Bank of Scotland',
  'Halifax',
  'RBS',
  
  // Specialist Car Finance
  'Black Horse',
  'MotoNovo Finance',
  'Close Brothers Motor Finance',
  'Alphera Financial Services',
  'BMW Financial Services',
  'Mercedes-Benz Financial Services',
  'Volkswagen Financial Services',
  'Ford Credit',
  'Toyota Financial Services',
  'Honda Financial Services',
  'Nissan Finance',
  'Hyundai Capital UK',
  'Kia Finance',
  'Volvo Car Financial Services',
  'JLR Financial Services',
  'Audi Financial Services',
  'MINI Financial Services',
  'Peugeot Finance',
  'Citroen Finance',
  'Vauxhall Finance',
  'Renault Finance',
  'Mazda Financial Services',
  'Suzuki Financial Services',
  'Seat Finance',
  'Skoda Financial Services',
  
  // Other Finance Providers
  'Startline Motor Finance',
  'First Response Finance',
  'Zuto',
  'CarFinance 247',
  'Moneybarn',
  'Billing Finance',
  'Marsh Finance',
  'Evolution Funding',
  'Blue Motor Finance',
  'Oodle Car Finance',
  'Carmoola',
  '1st Stop Car Finance',
  'Creditplus',
  'AppleGreen Finance',
  'Northridge Finance',
  'PCF Bank',
  'Advantage Finance',
  'Hitachi Capital Vehicle Solutions',
  'Secure Trust Bank Motor Finance',
  'Aldermore',
  'Shawbrook Bank',
  'United Trust Bank',
  'Mann Island Finance',
  'CA Auto Finance',
  'PSA Finance',
  'FCA Automotive Services',
]

export const UK_CREDIT_CARD_PROVIDERS = [
  // Major Banks
  'Barclaycard',
  'Lloyds Bank',
  'Halifax',
  'HSBC',
  'NatWest',
  'RBS',
  'Santander',
  'TSB',
  'Nationwide',
  'Bank of Scotland',
  'Metro Bank',
  'Monzo',
  'Starling Bank',
  'Revolut',
  'Chase UK',
  
  // Credit Card Specialists
  'American Express',
  'Capital One',
  'MBNA',
  'Tesco Bank',
  'Sainsbury\'s Bank',
  'John Lewis Partnership Card',
  'M&S Bank',
  'Amazon Platinum Mastercard',
  'Virgin Money',
  'NewDay',
  'Aqua',
  'Marbles',
  'Fluid',
  'Ocean',
  'Vanquis',
  'Luma',
  'Chrome',
  'Creation Financial Services',
  'Post Office Money',
  'AA Credit Card',
]

export const UK_LOAN_PROVIDERS = [
  // Major Banks
  'Barclays',
  'Lloyds Bank',
  'Halifax',
  'HSBC',
  'NatWest',
  'RBS',
  'Santander',
  'TSB',
  'Nationwide',
  'Bank of Scotland',
  'Metro Bank',
  'Virgin Money',
  
  // Online Lenders
  'Zopa',
  'Funding Circle',
  'RateSetter',
  'LendingWorks',
  'Monzo',
  'Starling Bank',
  
  // Specialist Lenders
  'Hitachi Personal Finance',
  'Shawbrook Bank',
  'Aldermore',
  'United Trust Bank',
  'Close Brothers',
  'Tesco Bank',
  'Sainsbury\'s Bank',
  'M&S Bank',
  'Post Office Money',
  
  // Subprime / High Cost
  'Vanquis',
  'Provident',
  'Moneybarn',
  'Everyday Loans',
  '118 118 Money',
  'Loans 2 Go',
  'Amigo Loans',
  'Guarantor My Loan',
  'Lending Stream',
  'Sunny',
  'QuickQuid',
  'Wonga',
  'PiggyBank',
  'SafetyNet Credit',
]

export const UK_HOLIDAY_PARK_COMPANIES = [
  // Major Holiday Park Operators
  'Haven Holidays',
  'Center Parcs',
  'Parkdean Resorts',
  'Park Holidays UK',
  'Away Resorts',
  'Darwin Escapes',
  'Hoseasons',
  'Butlins',
  'Pontins',
  'Warner Leisure Hotels',
  
  // Timeshare Companies
  'Diamond Resorts',
  'Marriott Vacation Club',
  'Hilton Grand Vacations',
  'Wyndham Destinations',
  'RCI',
  'Interval International',
  'Azure Resorts',
  'Silverpoint',
  'Club La Costa',
  'Anfi Group',
  
  // Static Caravan Parks
  'Willerby',
  'ABI UK',
  'Pemberton Leisure Homes',
  'Atlas Leisure Homes',
  'Swift Group',
  'Carnaby Caravans',
  'Victory Leisure Homes',
  'Delta Caravans',
  'BK Bluebird',
  'Tingdene Homes',
]

export const CAR_MANUFACTURERS = [
  'Alfa Romeo',
  'Aston Martin',
  'Audi',
  'Bentley',
  'BMW',
  'Citroen',
  'Cupra',
  'Dacia',
  'DS',
  'Ferrari',
  'Fiat',
  'Ford',
  'Honda',
  'Hyundai',
  'Infiniti',
  'Jaguar',
  'Jeep',
  'Kia',
  'Lamborghini',
  'Land Rover',
  'Lexus',
  'Lotus',
  'Maserati',
  'Mazda',
  'McLaren',
  'Mercedes-Benz',
  'MG',
  'Mini',
  'Mitsubishi',
  'Nissan',
  'Peugeot',
  'Polestar',
  'Porsche',
  'Renault',
  'Rolls-Royce',
  'Seat',
  'Skoda',
  'Smart',
  'Subaru',
  'Suzuki',
  'Tesla',
  'Toyota',
  'Vauxhall',
  'Volkswagen',
  'Volvo',
]

// Helper function to search lenders
export function searchLenders(query: string, type: 'car' | 'credit' | 'loan' | 'holiday'): string[] {
  const q = query.toLowerCase()
  let list: string[] = []
  
  switch (type) {
    case 'car':
      list = UK_CAR_FINANCE_LENDERS
      break
    case 'credit':
      list = UK_CREDIT_CARD_PROVIDERS
      break
    case 'loan':
      list = UK_LOAN_PROVIDERS
      break
    case 'holiday':
      list = UK_HOLIDAY_PARK_COMPANIES
      break
  }
  
  return list.filter(name => name.toLowerCase().includes(q)).slice(0, 8)
}

export function searchCarMakes(query: string): string[] {
  const q = query.toLowerCase()
  return CAR_MANUFACTURERS.filter(make => make.toLowerCase().includes(q)).slice(0, 8)
}
