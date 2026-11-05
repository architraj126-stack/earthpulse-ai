# Statistical Methods: Seasonal Mann-Kendall and Climatological De-seasoning

## The Challenge of Seasonality in Environmental Time Series
Environmental variables exhibit prominent annual periodicity governed by Earth's orbital geometry and solar declination:
- Summer vs. winter temperatures
- Monsoonal wet vs. dry seasons
- Annual green-up and leaf senescence cycles

If an environmental time series exhibits pronounced seasonal oscillations, standard non-seasonal Mann-Kendall tests can suffer from confounded pairwise comparisons (e.g., comparing July maximum temperatures directly to January minimum temperatures), inflating sample variance and potentially masking subtle inter-annual decadal trends.

## The Seasonal Mann-Kendall (SMK) Test
Proposed by Hirsch, Slack, and Smith (1982) for US Geological Survey hydrological time series:
1. The data is partitioned into $m$ distinct seasonal subsets (for monthly data, $m = 12$; January subset, February subset, ..., December subset).
2. The Mann-Kendall statistic $S_g$ and variance $\text{Var}(S_g)$ are computed independently for each individual month across all available years:
$$S_g = \sum_{k=1}^{n_g - 1} \sum_{j=k+1}^{n_g} \text{sgn}(x_{jg} - x_{kg})$$
3. The total seasonal test statistic $\hat{S}$ is the sum of the individual seasonal statistics:
$$\hat{S} = \sum_{g=1}^m S_g$$
4. Assuming cross-season independence (or accounting for covariance when serial correlation exists):
$$\text{Var}(\hat{S}) = \sum_{g=1}^m \text{Var}(S_g)$$
5. The standardized seasonal test statistic $\hat{Z}$ is evaluated against the standard normal distribution $\mathcal{N}(0, 1)$.

## Monthly Climatology & Anomaly Decomposition
An alternative complementary technique is decomposing the observed monthly series $Y_{t}$ into:
$$Y_{t} = C_{m(t)} + A_t$$
where $C_{m}$ is the 30-year monthly climatological mean for month $m$, and $A_t$ is the deseasoned monthly anomaly. Running linear regression or Mann-Kendall testing directly upon $A_t$ isolates long-term climate signals from the recurring seasonal cycle.
