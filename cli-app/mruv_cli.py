import matplotlib.pyplot as plt
import numpy as np

def calcular_aceleracao(v0, v, t):
    """Calcula a aceleração usando a fórmula a = (v - v0) / t"""
    if t == 0:
        raise ValueError("O tempo não pode ser zero!")
    return (v - v0) / t

def calcular_velocidade_final(v0, a, t):
    """Calcula a velocidade final usando v = v0 + a*t"""
    return v0 + a * t

def calcular_tempo(v0, v, a):
    """Calcula o tempo usando t = (v - v0) / a"""
    if a == 0:
        raise ValueError("A aceleração não pode ser zero!")
    return (v - v0) / a

def calcular_deslocamento(v0, a, t):
    """Calcula o deslocamento usando s = v0*t + 0.5*a*t²"""
    return v0 * t + 0.5 * a * t ** 2

def plotar_grafico(v0, a, t):
    """Gera um gráfico de velocidade vs tempo"""
    tempo = np.linspace(0, t, 100)
    velocidade = v0 + a * tempo
    
    plt.figure(figsize=(10, 6))
    plt.plot(tempo, velocidade, 'b-', linewidth=2)
    plt.title('MRUV: Velocidade vs Tempo')
    plt.xlabel('Tempo (s)')
    plt.ylabel('Velocidade (m/s)')
    plt.grid(True, linestyle='--', alpha=0.7)
    plt.axhline(y=0, color='k', linestyle='-')
    plt.axvline(x=0, color='k', linestyle='-')
    plt.show()

def main():
    print("\n" + "="*50)
    print("SIMULADOR DE MRUV - MOVIMENTO RETILÍNEO UNIFORMEMENTE VARIADO")
    print("="*50)
    
    while True:
        print("\nOpções:")
        print("1. Calcular aceleração (a)")
        print("2. Calcular velocidade final (v)")
        print("3. Calcular tempo (t)")
        print("4. Calcular deslocamento (s)")
        print("5. Plotar gráfico velocidade vs tempo")
        print("6. Sair")
        
        escolha = input("\nEscolha uma opção (1-6): ")
        
        try:
            if escolha == '1':
                v0 = float(input("Velocidade inicial (v0) em m/s: "))
                v = float(input("Velocidade final (v) em m/s: "))
                t = float(input("Tempo (t) em segundos: "))
                a = calcular_aceleracao(v0, v, t)
                print(f"\nResultado: a = {a:.2f} m/s²")
                print(f"Fórmula: a = (v - v0) / t = ({v} - {v0}) / {t}")
                
            elif escolha == '2':
                v0 = float(input("Velocidade inicial (v0) em m/s: "))
                a = float(input("Aceleração (a) em m/s²: "))
                t = float(input("Tempo (t) em segundos: "))
                v = calcular_velocidade_final(v0, a, t)
                print(f"\nResultado: v = {v:.2f} m/s")
                print(f"Fórmula: v = v0 + a*t = {v0} + {a}*{t}")
                
            elif escolha == '3':
                v0 = float(input("Velocidade inicial (v0) em m/s: "))
                v = float(input("Velocidade final (v) em m/s: "))
                a = float(input("Aceleração (a) em m/s²: "))
                t = calcular_tempo(v0, v, a)
                print(f"\nResultado: t = {t:.2f} s")
                print(f"Fórmula: t = (v - v0) / a = ({v} - {v0}) / {a}")
                
            elif escolha == '4':
                v0 = float(input("Velocidade inicial (v0) em m/s: "))
                a = float(input("Aceleração (a) em m/s²: "))
                t = float(input("Tempo (t) em segundos: "))
                s = calcular_deslocamento(v0, a, t)
                print(f"\nResultado: s = {s:.2f} m")
                print(f"Fórmula: s = v0*t + 0.5*a*t² = {v0}*{t} + 0.5*{a}*{t}²")
                
            elif escolha == '5':
                v0 = float(input("Velocidade inicial (v0) em m/s: "))
                a = float(input("Aceleração (a) em m/s²: "))
                t = float(input("Tempo total (t) em segundos: "))
                plotar_grafico(v0, a, t)
                
            elif escolha == '6':
                print("\nEncerrando o simulador...")
                break
                
            else:
                print("\nOpção inválida. Tente novamente!")
                
        except ValueError as e:
            print(f"\nErro: {e}")
        except Exception as e:
            print(f"\nOcorreu um erro: {e}")

if __name__ == "__main__":
    main()