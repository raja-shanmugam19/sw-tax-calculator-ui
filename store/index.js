import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const createStore = () => {
  return new Vuex.Store({
    state: () => ({
      calculationHistory: [],
    }),
    mutations: {
      setCalculationHistory(state, history) {
        state.calculationHistory = history;
      },
      deleteCalculation(state, calculationId) {
        state.calculationHistory = state.calculationHistory.filter(item => item._id !== calculationId);
      },
    },
    actions: {
      async fetchCalculationHistory({ commit }) {
        try {
          const response = await fetch(`${process.env.API_URL}/tax-calculator/calculation-history`);
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          commit('setCalculationHistory', data);
        } catch (error) {
          console.error('Failed to fetch calculation history:', error);
        }
      },
      async deleteCalculation({ commit }, calculationId) {
        try {
          const response = await fetch(`${process.env.API_URL}/tax-calculator/delete-record/${calculationId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            commit('deleteCalculation', calculationId);
          } else {
            console.error('Failed to delete calculation');
          }
        } catch (error) {
          console.error('Error deleting calculation:', error);
        }
      },
    },
    getters: {
      getCalculationHistory: state => state.calculationHistory,
    },
  });
};

export default createStore;
