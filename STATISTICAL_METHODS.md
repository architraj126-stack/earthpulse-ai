# EarthPulse AI — Statistical Trend Analysis & Mathematical Methodology

EarthPulse AI implements rigorous, verified statistical tests following guidelines from World Meteorological Organization (WMO) and IPCC AR6 standards to detect, quantify, and evaluate the statistical significance of environmental trends.

---

## 1. Ordinary Least Squares (OLS) Linear Regression

### Formulation
Models an observed environmental parameter $Y_i$ as a linear function of time $X_i$ (expressed in decimal calendar years):
$$Y_i = \beta_0 + \beta_1 X_i + \epsilon_i$$
where:
- $\beta_1$ is the linear slope (rate of change per year, e.g., °C/year).
- $\beta_0$ is the intercept.
- $\epsilon_i \sim \mathcal{N}(0, \sigma^2)$ represents random residual error.

### Analytical Estimators
$$\hat{\beta}_1 = \frac{\sum_{i=1}^n (X_i - \bar{X})(Y_i - \bar{Y})}{\sum_{i=1}^n (X_i - \bar{X})^2}$$
$$\hat{\beta}_0 = \bar{Y} - \hat{\beta}_1 \bar{X}$$

### Coefficient of Determination ($R^2$)
$$R^2 = 1 - \frac{\sum (Y_i - \hat{Y}_i)^2}{\sum (Y_i - \bar{Y})^2}$$

### Standard Error & 95% Confidence Intervals
$$s^2 = \frac{1}{n - 2} \sum_{i=1}^n (Y_i - \hat{Y}_i)^2$$
$$SE_{\hat{\beta}_1} = \frac{s}{\sqrt{\sum (X_i - \bar{X})^2}}$$
$$\text{CI}_{95\%} = \hat{\beta}_1 \pm t_{n-2, \, 0.975} \cdot SE_{\hat{\beta}_1}$$

---

## 2. Mann-Kendall Non-Parametric Trend Test

The Mann-Kendall test (Mann, 1945; Kendall, 1975) is the primary test used by EarthPulse AI to determine monotonic trend significance. Because it relies exclusively on relative ordinal ranks rather than absolute values, it makes no assumptions regarding normal distribution and is immune to outliers and non-linearities.

### Test Statistic $S$
For time series $\{x_1, x_2, \dots, x_n\}$:
$$S = \sum_{k=1}^{n-1} \sum_{j=k+1}^n \text{sgn}(x_j - x_k)$$
$$\text{sgn}(\theta) = \begin{cases} +1 & \text{if } \theta > 0 \\ 0 & \text{if } \theta = 0 \\ -1 & \text{if } \theta < 0 \end{cases}$$

### Kendall's Rank Correlation Coefficient ($\tau$)
$$\tau = \frac{S}{\frac{1}{2} n (n - 1)}$$
- $\tau > 0$: Monotonic increasing tendency.
- $\tau < 0$: Monotonic decreasing tendency.
- Bounded strictly between $-1.0$ and $+1.0$.

### Variance of $S$
$$\text{Var}(S) = \frac{1}{18} \left[ n(n - 1)(2n + 5) - \sum_{p=1}^g t_p (t_p - 1)(2t_p + 5) \right]$$
where $g$ is the number of tied value groups and $t_p$ is the size of the $p$-th tied group.

### Standardized Test Statistic $Z$
$$Z = \begin{cases} \frac{S - 1}{\sqrt{\text{Var}(S)}} & \text{if } S > 0 \\ 0 & \text{if } S = 0 \\ \frac{S + 1}{\sqrt{\text{Var}(S)}} & \text{if } S < 0 \end{cases}$$

### Two-Tailed P-Value Calculation
$$p = 2 \left( 1 - \Phi(|Z|) \right)$$
where $\Phi$ is the standard normal cumulative distribution function. At significance level $\alpha = 0.05$, the null hypothesis $H_0$ (no monotonic trend) is rejected when $p < 0.05$ (corresponding to $|Z| > 1.96$).

---

## 3. Sen's Slope Estimator (Theil-Sen Median Slope)

While Mann-Kendall evaluates whether a trend exists, Sen's slope estimator (Sen, 1968; Theil, 1950) provides the robust non-parametric quantification of the annual rate of change.

### Formulation
For all pairs $(x_j, x_k)$ where $j > k$:
$$Q_m = \frac{x_j - x_k}{j - k} \quad \text{for } m = 1, 2, \dots, N = \frac{n(n - 1)}{2}$$
Sen's slope is the median of all pairwise slopes:
$$\beta_{\text{Sen}} = \text{median}\left(\{Q_1, Q_2, \dots, Q_N\}\right)$$

### Rate Scaling to Annual Units
- **Monthly Series**: $\text{Annual Rate} = \beta_{\text{Sen, monthly}} \times 12.0$
- **Daily Series**: $\text{Annual Rate} = \beta_{\text{Sen, daily}} \times 365.25$

---

## 4. Seasonal Mann-Kendall Test

For monthly time series with $n \ge 24$ points (at least 2 full years), EarthPulse AI provides the Seasonal Mann-Kendall test (Hirsch et al., 1982) with seasonal period $m = 12$.
The test computes $S_g$ and $\text{Var}(S_g)$ independently for each calendar month (Jan, Feb, ..., Dec) across years, summing across seasons:
$$\hat{S} = \sum_{g=1}^{12} S_g, \quad \text{Var}(\hat{S}) = \sum_{g=1}^{12} \text{Var}(S_g)$$
This isolates genuine multi-year decadal trends from the natural seasonal cycle without confounding summer and winter observations.

---

## 5. Statistical Significance Evaluation Matrix

EarthPulse AI combines trend direction with statistical significance at $\alpha = 0.05$:

| Trend Direction | Significance ($p$-value) | Status Category | Color Code |
|---|---|---|---|
| Increasing ($\beta > 0$) | $p < 0.05$ | **Statistically Significant Increase** | **Green** (`#35D07F`) |
| Decreasing ($\beta < 0$) | $p < 0.05$ | **Statistically Significant Decrease** | **Red** (`#FF4D4D`) |
| Increasing / Decreasing | $p \ge 0.05$ | **No Statistically Significant Trend** | **Grey** (`#9BAEC2`) |

> **Scientific Caution**: Statistical significance demonstrates mathematical rejection of the null hypothesis under observed variance. It does not independently prove human vs. natural causation. Physical attribution requires coupled climate modeling and fingerprinting.
