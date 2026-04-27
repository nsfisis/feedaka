package cmd

import "testing"

func TestNextFetchInterval(t *testing.T) {
	tests := []struct {
		name           string
		current        int64
		hadNewArticles bool
		want           int64
	}{
		{"new articles halve from mid-range", 14400, true, 7200},
		{"new articles halve from max", maxFetchIntervalSeconds, true, 43200},
		{"new articles clamp at min when halving below", 3600, true, minFetchIntervalSeconds},
		{"new articles clamp at min from slightly above", 4000, true, minFetchIntervalSeconds},
		{"no articles grow by 1.5x from min", minFetchIntervalSeconds, false, 5400},
		{"no articles grow by 1.5x from mid-range", 14400, false, 21600},
		{"no articles clamp at max", maxFetchIntervalSeconds, false, maxFetchIntervalSeconds},
		{"no articles clamp at max from slightly below", 60000, false, maxFetchIntervalSeconds},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := nextFetchInterval(tt.current, tt.hadNewArticles)
			if got != tt.want {
				t.Errorf("nextFetchInterval(%d, %v) = %d, want %d", tt.current, tt.hadNewArticles, got, tt.want)
			}
		})
	}
}
