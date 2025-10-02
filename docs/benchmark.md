# Benchmark Results

This document presents a performance comparison between `nestjs-saop` and other leading AOP (Aspect-Oriented Programming) libraries. The benchmarks measure key performance indicators: initialization time, first call overhead, and average call time under sustained load.

## 📊 Benchmark Environment

All benchmarks were conducted in the following environment, with each test repeated 100 times to ensure statistical significance.

- **Hardware**: 
  - CPU: `AMD Ryzen 5 7530U with Radeon Graphics / 2.00GHZ`
  - RAM: `16GB / 3200MT/s`
  - OS: `Windows 11 Home`
- **Node.js Version**: `v22.20.0`
- **Libraries Tested**:
  - `nestjs-saop`
  - `@toss/nestjs-aop`
  - `aspectjs`

The source code for these benchmarks can be found at: https://github.com/miinhho/nestjs-saop-benchmark

<br>

## ⚡ Initialization Time Analysis

The time required for a NestJS application to initialize with each AOP library integrated. Lower initialization time indicates faster application startup.

| Library                 | Avg (ms) | Min (ms) | Max (ms) | Median (ms) | StdDev (ms) |
| ----------------------- | -------- | -------- | -------- | ----------- | ----------- |
| 🥇 `nestjs-saop`      | 225.83   | 218.16   | 490.89   | 222.06      | 26.89       |
| 🥈 `@toss/nestjs-aop`   | 235.73   | 218.48   | 408.06   | 221.92      | 35.43       |
| 🥉 `aspectjs`            | 239.95   | 230.12   | 361.41   | 233.37      | 18.54       |


## 🔥 First Call Time Analysis

The overhead of the first execution of an advised method. Lower first-call time is critical for applications where initial response time matters.

| Library                 | Avg (ms) | Min (ms) | Max (ms) | Median (ms) | StdDev (ms) |
| ----------------------- | -------- | -------- | -------- | ----------- | ----------- |
| 🥇 `nestjs-saop`      | 0.11     | 0.10     | 0.16     | 0.11        | 0.01        |
| 🥈 `@toss/nestjs-aop`   | 0.16     | 0.14     | 0.35     | 0.15        | 0.04        |
| 🥉 `aspectjs`            | 1.63     | 1.44     | 2.85     | 1.56        | 0.23        |

## 🚀 Average Call Time Analysis

The average execution time of an advised method over sustained usage. This metric is essential for understanding the performance impact on regular application throughput.

| Library                 | Avg (ms) | Min (ms) | Max (ms) | Median (ms) | StdDev (ms) |
| ----------------------- | -------- | -------- | -------- | ----------- | ----------- |
| 🥇 `nestjs-saop`      | 0.0018   | 0.0015   | 0.0028   | 0.0018      | 0.0001      |
| 🥈 `@toss/nestjs-aop`   | 0.0026   | 0.0021   | 0.0056   | 0.0025      | 0.0005      |
| 🥉 `aspectjs`            | 0.1771   | 0.1636   | 0.2874   | 0.1706      | 0.0191      |