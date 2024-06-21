<template>
  <VContainer>
    <VCard class="mx-auto" max-width="600">
      <VCardTitle>Superannuation Calculator</VCardTitle>
      <VCardText>
        <v-form @submit.prevent="handleSubmit">
          <VTextField
            label="Username"
            v-model="formData.username"
            required
            :rules="[(v) => !!v || 'Username is required']"
          ></VTextField>

          <VRadioGroup v-model="formData.incomeType" row>
            <VRadio label="Gross Amount" value="gross"></VRadio>
            <VRadio
              label="Gross + Superannuation Amount"
              value="grossAndSuper"
            ></VRadio>
          </VRadioGroup>

          <VTextField
            label="Income"
            v-model="formData.income"
            type="number"
            min="0.01"
            required
            :rules="[(v) => !!v || 'Income is required']"
          ></VTextField>

          <VTextField
            label="Superannuation Percentage (%)"
            v-model="formData.superannuationPercentage"
            type="number"
            min="10.5"
            required
            :rules="[(v) => !!v || 'Superannuation percentage is required']"
          ></VTextField>

          <VTextField
            label="Tax Rates Year"
            v-model="formData.taxYear"
            type="number"
            required
            :rules="[(v) => !!v || 'Tax year is required']"
          ></VTextField>

          <VBtn type="submit" color="primary">Calculate</VBtn>
        </v-form>
      </VCardText>
    </VCard>
    <CalculationHistory />
    <v-snackbar v-model="snackbar.show">
      {{ snackbar.message }}
      <v-btn color="green" text @click="snackbar.show = false">Close</v-btn>
    </v-snackbar>
  </VContainer>
</template>

<script setup>
import { ref } from "vue";
import "vuetify/styles";
import CalculationHistory from "./calculation-history";

const formData = ref({
  username: "",
  incomeType: "gross",
  income: 0,
  superannuationPercentage: 10.5,
  taxYear: 2023,
});

const snackbar = ref({ show: false, message: "" });

const taxRates = ref([
  { lowerLimit: 0, upperLimit: 18200, rate: 0 },
  { lowerLimit: 18201, upperLimit: 45000, rate: 0.19 },
  { lowerLimit: 45001, upperLimit: 120000, rate: 0.325 },
  { lowerLimit: 120001, upperLimit: 180000, rate: 0.37 },
  { lowerLimit: 180001, upperLimit: Infinity, rate: 0.45 },
]);

const handleSubmit = async () => {
  if (!validateForm()) {
    snackbar.value.message = "Please fill all mandatory fields.";
    snackbar.value.show = true;
    return;
  }

  const superContribution =
    formData.value.income * (formData.value.superannuationPercentage / 100);

  let grossAmount;
  if (formData.value.incomeType === "grossAndSuper") {
    grossAmount = formData.value.income - superContribution;
  } else {
    grossAmount = formData.value.income;
  }

  const taxAmount = calculateTax(grossAmount);

  const calculated = {
    superContribution: superContribution.toFixed(2),
    grossAmount: Number(grossAmount).toFixed(2),
    grossAndSuper:
      formData.value.incomeType === "grossAndSuper"
        ? Number(formData.value.income).toFixed(2)
        : (Number(grossAmount) + superContribution).toFixed(2),
    taxAmount: taxAmount.toFixed(2),
    netAmount: (grossAmount - taxAmount).toFixed(2),
    netAndSuper: (grossAmount - taxAmount + superContribution).toFixed(2),
  };

  try {
    const response = await fetch(
      "http://localhost:8080/tax-calculator/create-record",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.value.username,
          superContribution: parseInt(superContribution),
          incomeType: formData.value.incomeType,
          income: parseInt(formData.value.income),
          superannuationPercentage: parseFloat(
            formData.value.superannuationPercentage
          ),
          taxRatesYear: parseInt(formData.value.taxYear),
          grossAmount: parseFloat(calculated.grossAmount),
          grossPlusSuperannuationAmount: parseFloat(calculated.grossAndSuper),
          taxAmount: parseFloat(calculated.taxAmount),
          netAmount: parseFloat(calculated.netAmount),
          netAndSuper: parseFloat(calculated.netAndSuper),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    snackbar.value.message = "Record has been saved";
    snackbar.value.show = true;
  } catch (error) {
    console.error("API call error:", error);
    alert("Failed to save record");
  }
};

const calculateTax = (grossAmount) => {
  if (!taxRates.value) return 0;

  let tax = 0;

  for (const bracket of taxRates.value) {
    if (grossAmount <= bracket.upperLimit) {
      tax += (grossAmount - bracket.lowerLimit) * bracket.rate;
      break;
    } else {
      tax += (bracket.upperLimit - bracket.lowerLimit) * bracket.rate;
      grossAmount -= bracket.upperLimit - bracket.lowerLimit;
    }
  }

  return tax;
};

const validateForm = () => {
  return (
    formData.value.username &&
    formData.value.incomeType &&
    formData.value.income !== null &&
    formData.value.superannuationPercentage !== null &&
    formData.value.taxYear !== null
  );
};
</script>
