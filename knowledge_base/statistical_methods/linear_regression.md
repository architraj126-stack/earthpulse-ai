# Statistical Methods: Ordinary Least Squares (OLS) Linear Regression

## Overview & Mathematical Formulation
Ordinary Least Squares (OLS) linear regression models the expected linear trend in an environmental variable $Y$ as a function of time $X$:
$$Y_i = \beta_0 + \beta_1 X_i + \epsilon_i$$
where:
- $Y_i$ is the environmental observation at time index $X_i$ (expressed as calendar years or fractional years).
- $\beta_1$ is the trend slope (rate of change per unit time, e.g., °C/year).
- $\beta_0$ is the intercept.
- $\epsilon_i \sim \mathcal{N}(0, \sigma^2)$ are independent and identically distributed residual errors.

## Parameter Estimators
The slope ($\hat{\beta}_1$) and intercept ($\hat{\beta}_0$) minimize the sum of squared residuals:
$$\hat{\beta}_1 = \frac{\sum_{i=1}^n (X_i - \bar{X})(Y_i - \bar{Y})}{\sum_{i=1}^n (X_i - \bar{X})^2}$$
$$\hat{\beta}_0 = \bar{Y} - \hat{\beta}_1 \bar{X}$$

The Coefficient of Determination ($R^2$) represents the proportion of total variance explained by the linear time trend:
$$R^2 = 1 - \frac{\sum (Y_i - \hat{Y}_i)^2}{\sum (Y_i - \bar{Y})^2}$$

## Standard Error & 95% Confidence Intervals
The standard error of the slope ($SE_{\hat{\beta}_1}$) is computed as:
$$s^2 = \frac{1}{n - 2} \sum_{i=1}^n (Y_i - \hat{Y}_i)^2$$
$$SE_{\hat{\beta}_1} = \frac{s}{\sqrt{\sum (X_i - \bar{X})^2}}$$

The two-sided 95% confidence interval for the rate of change is:
$$\text{CI}_{95\%} = \hat{\beta}_1 \pm t_{n-2, \, 0.975} \cdot SE_{\hat{\beta}_1}$$

## Key Assumptions & Scientific Limitations in Earth Science
1. **Normality of Residuals**: OLS assumes Gaussian residuals. Environmental variables like precipitation, river discharge, and extreme winds violate this normality assumption.
2. **Homoscedasticity**: Constant residual variance across the full time period is assumed.
3. **Absence of Autocorrelation**: Daily and monthly environmental observations frequently exhibit serial correlation (autocorrelation at lag 1). Positive autocorrelation inflates the apparent significance (underestimates standard errors and p-values), necessitating non-parametric verification.

---
**Source Reference:** [https://www.itl.nist.gov/div898/handbook/pmd/section1/pmd141.htm](https://www.itl.nist.gov/div898/handbook/pmd/section1/pmd141.htm)
