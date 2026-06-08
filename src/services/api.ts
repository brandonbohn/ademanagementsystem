const API_URL = import.meta.env.VITE_API_URL || 'https://adebackend.onrender.com/api';

// Budget API
export const budgetAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/budgets`);
    if (!response.ok) throw new Error('Failed to fetch budgets');
    return response.json();
  },
  
  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/budgets/${id}`);
    if (!response.ok) throw new Error('Failed to fetch budget');
    return response.json();
  },
  
  create: async (budget: any) => {
    const response = await fetch(`${API_URL}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(budget)
    });
    if (!response.ok) throw new Error('Failed to create budget');
    return response.json();
  },
  
  update: async (id: string, budget: any) => {
    const response = await fetch(`${API_URL}/budgets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(budget)
    });
    if (!response.ok) throw new Error('Failed to update budget');
    return response.json();
  },
  
  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/budgets/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete budget');
    return response.json();
  }
};

// Program API
export const programAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/programs`);
    if (!response.ok) throw new Error('Failed to fetch programs');
    return response.json();
  },
  
  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/programs/${id}`);
    if (!response.ok) throw new Error('Failed to fetch program');
    return response.json();
  },
  
  create: async (program: any) => {
    try {
      const response = await fetch(`${API_URL}/programs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(program)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Failed to create program (${response.status})`);
      }
      return data;
    } catch (error: any) {
      console.error('Error creating program:', error);
      throw error;
    }
  },
  
  update: async (id: string, program: any) => {
    const response = await fetch(`${API_URL}/programs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(program)
    });
    if (!response.ok) throw new Error('Failed to update program');
    return response.json();
  },
  
  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/programs/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete program');
    return response.json();
  }
};

// Expense API
export const expenseAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/expenses`);
    if (!response.ok) throw new Error('Failed to fetch expenses');
    return response.json();
  },
  
  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/expenses/${id}`);
    if (!response.ok) throw new Error('Failed to fetch expense');
    return response.json();
  },
  
  create: async (expense: any) => {
    const response = await fetch(`${API_URL}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense)
    });
    if (!response.ok) throw new Error('Failed to create expense');
    return response.json();
  },
  
  update: async (id: string, expense: any) => {
    const response = await fetch(`${API_URL}/expenses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense)
    });
    if (!response.ok) throw new Error('Failed to update expense');
    return response.json();
  },
  
  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/expenses/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete expense');
    return response.json();
  }
};

// Report API
export const reportAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/reports`);
    if (!response.ok) throw new Error('Failed to fetch reports');
    return response.json();
  },
  
  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/reports/${id}`);
    if (!response.ok) throw new Error('Failed to fetch report');
    return response.json();
  },
  
  create: async (report: any) => {
    const response = await fetch(`${API_URL}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    });
    if (!response.ok) throw new Error('Failed to create report');
    return response.json();
  },
  
  update: async (id: string, report: any) => {
    const response = await fetch(`${API_URL}/reports/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    });
    if (!response.ok) throw new Error('Failed to update report');
    return response.json();
  },
  
  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/reports/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete report');
    return response.json();
  }
};

// Donor System Content API
export const contentAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/donor-system-content`);
    if (!response.ok) throw new Error('Failed to fetch content');
    return response.json();
  },
  
  getSection: async (section: string) => {
    const response = await fetch(`${API_URL}/donor-system-content/${section}`);
    if (!response.ok) throw new Error(`Failed to fetch ${section} content`);
    return response.json();
  },
  
  updateAll: async (content: any) => {
    const response = await fetch(`${API_URL}/donor-system-content`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content)
    });
    if (!response.ok) throw new Error('Failed to update content');
    return response.json();
  },
  
  updateSection: async (section: string, data: any) => {
    const response = await fetch(`${API_URL}/donor-system-content/${section}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Failed to update ${section} content`);
    return response.json();
  },
  
  deleteBudgetCategory: async (categoryId: string) => {
    const response = await fetch(`${API_URL}/donor-system-content/budgets/categories/${categoryId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete budget category');
    return response.json();
  }
};

// Donor API
export const donorAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/donors`);
    if (!response.ok) throw new Error('Failed to fetch donors');
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/donors/${id}`);
    if (!response.ok) throw new Error('Failed to fetch donor');
    return response.json();
  },

  create: async (donor: any) => {
    const response = await fetch(`${API_URL}/donors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(donor)
    });
    if (!response.ok) throw new Error('Failed to create donor');
    return response.json();
  },

  update: async (id: string, donor: any) => {
    const response = await fetch(`${API_URL}/donors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(donor)
    });
    if (!response.ok) throw new Error('Failed to update donor');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/donors/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete donor');
    return response.json();
  }
};

// Girls API
export const girlsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/girls`);
    if (!response.ok) throw new Error('Failed to fetch girls');
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/girls/${id}`);
    if (!response.ok) throw new Error('Failed to fetch girl');
    return response.json();
  },

  create: async (girl: any) => {
    const response = await fetch(`${API_URL}/girls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(girl)
    });
    if (!response.ok) throw new Error('Failed to create girl');
    return response.json();
  },

  update: async (id: string, girl: any) => {
    const response = await fetch(`${API_URL}/girls/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(girl)
    });
    if (!response.ok) throw new Error('Failed to update girl');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/girls/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete girl');
    return response.json();
  }
};

// Sponsorship API
export const sponsorshipAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/sponsorships`);
    if (!response.ok) throw new Error('Failed to fetch sponsorships');
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/sponsorships/${id}`);
    if (!response.ok) throw new Error('Failed to fetch sponsorship');
    return response.json();
  },

  create: async (sponsorship: any) => {
    const response = await fetch(`${API_URL}/sponsorships`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sponsorship)
    });
    if (!response.ok) throw new Error('Failed to create sponsorship');
    return response.json();
  },

  update: async (id: string, sponsorship: any) => {
    const response = await fetch(`${API_URL}/sponsorships/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sponsorship)
    });
    if (!response.ok) throw new Error('Failed to update sponsorship');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/sponsorships/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete sponsorship');
    return response.json();
  }
};

// Donation API
export const donationAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/donations`);
    if (!response.ok) throw new Error('Failed to fetch donations');
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/donations/${id}`);
    if (!response.ok) throw new Error('Failed to fetch donation');
    return response.json();
  },

  create: async (donation: any) => {
    const response = await fetch(`${API_URL}/donations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(donation)
    });
    if (!response.ok) throw new Error('Failed to create donation');
    return response.json();
  },

  update: async (id: string, donation: any) => {
    const response = await fetch(`${API_URL}/donations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(donation)
    });
    if (!response.ok) throw new Error('Failed to update donation');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/donations/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete donation');
    return response.json();
  }
};

// Team API
export const teamAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/team-members`);
    if (!response.ok) throw new Error('Failed to fetch team members');
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/team-members/${id}`);
    if (!response.ok) throw new Error('Failed to fetch team member');
    return response.json();
  },

  create: async (member: any) => {
    const response = await fetch(`${API_URL}/team-members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member)
    });
    if (!response.ok) throw new Error('Failed to create team member');
    return response.json();
  },

  update: async (id: string, member: any) => {
    const response = await fetch(`${API_URL}/team-members/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member)
    });
    if (!response.ok) throw new Error('Failed to update team member');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/team-members/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete team member');
    return response.json();
  }
};

// Participants API
export const participantAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/participants`);
    if (!response.ok) throw new Error('Failed to fetch participants');
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/participants/${id}`);
    if (!response.ok) throw new Error('Failed to fetch participant');
    return response.json();
  },

  create: async (participant: any) => {
    const response = await fetch(`${API_URL}/participants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(participant)
    });
    if (!response.ok) throw new Error('Failed to create participant');
    return response.json();
  },

  update: async (id: string, participant: any) => {
    const response = await fetch(`${API_URL}/participants/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(participant)
    });
    if (!response.ok) throw new Error('Failed to update participant');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/participants/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete participant');
    return response.json();
  }
};

// Grants API
export const grantAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/grants`);
    if (!response.ok) throw new Error('Failed to fetch grants');
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/grants/${id}`);
    if (!response.ok) throw new Error('Failed to fetch grant');
    return response.json();
  },

  create: async (grant: any) => {
    const response = await fetch(`${API_URL}/grants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(grant)
    });
    if (!response.ok) throw new Error('Failed to create grant');
    return response.json();
  },

  update: async (id: string, grant: any) => {
    const response = await fetch(`${API_URL}/grants/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(grant)
    });
    if (!response.ok) throw new Error('Failed to update grant');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/grants/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete grant');
    return response.json();
  }
};

