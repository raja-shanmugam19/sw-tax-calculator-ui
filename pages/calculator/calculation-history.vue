<template>
  <div v-if="calculationHistory.length > 0" class="history">
    <v-data-table
      :headers="headers"
      :items="calculationHistory"
      :items-per-page="5"
      class="elevation-1"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Calculation History</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
      </template>
      <template v-slot:item="props">
        <tr>
          <td>{{ props.item.username }}</td>
          <td>{{ props.item.taxYear }}</td>
          <td>{{ props.item.superContribution }}</td>
          <td>{{ props.item.grossAmount }}</td>
          <td v-if="props.item.incomeType === 'grossAndSuper'">
            {{ props.item.grossAndSuper }}
          </td>
          <td>{{ props.item.taxAmount }}</td>
          <td>{{ props.item.netAmount }}</td>
          <td>{{ props.item.netAndSuper }}</td>
          <td>
            <v-btn icon @click="deleteCalculation(props.item._id)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </td>
        </tr>
      </template>
    </v-data-table>
    <v-snackbar v-model="snackbar.show">
      {{ snackbar.message }}
      <v-btn color="green" text @click="snackbar.show = false">Close</v-btn>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, defineProps } from "vue";
import API_URLS from "../../server/api/api"

const calculationHistory = ref([]);

const snackbar = ref({ show: false, message: "" });

const deleteCalculation = async (calculationId) => {
  try {
    const response = await fetch(
      `http://localhost:8080/tax-calculator/delete-record/${calculationId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      calculationHistory.value = calculationHistory.value.filter(item => item._id !== calculationId);
      snackbar.value.message = "Record deleted successfully";
      snackbar.value.show = true;
    } else {
      console.error("Failed to delete calculation");
    }
  } catch (error) {
    console.error("Error deleting calculation:", error);
  }
};

const headers = [
  { title: "Username", value: "username" },
  { title: "Superannuation Amount", value: "superContribution" },
  { title: "Gross Amount", value: "grossAmount" },
  {
    title: "Gross + Superannuation Amount",
    value: "grossAndSuper",
    align: "center",
  },
  { title: "Tax Amount", value: "taxAmount" },
  { title: "Net Amount", value: "netAmount" },
  { title: "Net + Superannuation Amount", value: "netAndSuper" },
  { title: "Actions", value: "actions", align: "center" },
];

onMounted(async () => {
  try {
    const response = await fetch(
      "http://localhost:8080/tax-calculator/calculation-history"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    calculationHistory.value = data;
  } catch (error) {
    console.error("Failed to fetch calculation history:", error);
  }
});
</script>
