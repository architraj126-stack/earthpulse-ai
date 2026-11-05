# Statistical Methods: Sen's Slope Estimator (Theil-Sen Estimator)

## Overview & Scientific Rationale
While the Mann-Kendall test determines whether a statistically significant monotonic trend exists, it does not quantify the magnitude or rate of change. Sen's slope estimator (Sen, 1968; Theil, 1950) provides a robust non-parametric estimate of the true slope (annual rate of change) that is insensitive to outliers and missing observations.

## Mathematical Formulation
For all pairs of data points $(x_j, x_k)$ where $j > k$, the individual pairwise slope $Q_m$ is computed:
$$Q_m = \frac{x_j - x_k}{j - k}$$
For a time series of length $n$, there are $N = \frac{n(n - 1)}{2}$ pairwise slopes.

Sen's slope estimator $\beta_{\text{Sen}}$ is the **median** of all calculated pairwise slopes:
$$\beta_{\text{Sen}} = \text{median}\left(\{Q_1, Q_2, \dots, Q_N\}\right)$$

## Calculation of the Intercept
The non-parametric intercept $c$ is computed as the median of the residual differences:
$$c = \text{median}\left(\{x_i - \beta_{\text{Sen}} \cdot i \mid i = 1, \dots, n\}\right)$$

## Comparison with Ordinary Least Squares
| Metric | Sen's Slope Estimator | OLS Linear Regression |
|---|---|---|
| **Distributional Assumption** | None (Non-parametric) | Gaussian (Normal) residuals |
| **Sensitivity to Outliers** | Highly robust (Breakdown point ~29.3%) | Highly sensitive (Single outlier can distort slope) |
| **Missing Values Handling** | Inherently accommodates missing gaps | Requires continuous or interpolated spacing |
| **Computational Complexity** | $\mathcal{O}(n^2)$ | $\mathcal{O}(n)$ |
| **Recommended Variable Types** | Skewed variables (Precipitation, Wind, Solar) | Normally distributed variables (Temperature) |

## Rate Conversion to Annual Units
When analyzing daily data ($i$ measured in days), the daily Sen's slope is multiplied by 365.25:
$$\text{Annual Rate of Change} = \beta_{\text{Sen, daily}} \times 365.25$$
For monthly time series, the monthly Sen's slope is multiplied by 12:
$$\text{Annual Rate of Change} = \beta_{\text{Sen, monthly}} \times 12$$
