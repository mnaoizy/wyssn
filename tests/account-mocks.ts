// Mock modules for testing
export const mockStripe = {
  billingPortal: {
    sessions: {
      create: async () => ({ url: 'https://example.com/billing' }),
    },
  },
}

export const mockKindeServerSession = {
  getUser: async () => ({ id: null }),
}
