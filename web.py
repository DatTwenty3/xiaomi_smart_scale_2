import pandas as pd
import plotly.graph_objects as go
from dash import Dash, dcc, html
from dash.dependencies import Input, Output
import webbrowser
import threading


# Hàm đọc dữ liệu từ file CSV và lọc theo tên người dùng
def read_data(csv_file, name):
    df = pd.read_csv(csv_file)
    df['datetime'] = pd.to_datetime(df['datetime'], format = "%d/%m/%Y %H:%M")  # Đặt định dạng ngày tháng
    user_data = df[df['name'] == name]
    return user_data


# Hàm tạo biểu đồ các thông số theo thời gian
def create_graph(df, parameter, title, yaxis_title):
    fig = go.Figure()
    fig.add_trace(go.Scatter(x = df['datetime'], y = df[parameter], mode = 'lines+markers', name = parameter))
    fig.update_layout(title=title, xaxis_title='Ngày', yaxis_title=yaxis_title)
    return fig


# Hàm khởi tạo trang web Dash
def run_dashboard(csv_file, name):
    app = Dash(__name__)

    # Layout của trang web
    app.layout = html.Div([
        html.H1(f"BIỂU ĐỒ THEO DÕI SỨC KHOẺ CỦA {name.upper()}", style = {'textAlign': 'center'}),
        html.Div(id = 'latest-data'),
        dcc.Graph(id = 'weight-graph'),
        dcc.Graph(id = 'bmi-graph'),
        dcc.Graph(id = 'bmr-graph'),
        dcc.Graph(id = 'tdee-graph'),
        dcc.Graph(id = 'lean-body-mass-graph'),
        dcc.Graph(id = 'fat-percent-graph'),
        dcc.Graph(id = 'water-percent-graph'),
        dcc.Graph(id = 'bone-mass-graph'),
        dcc.Graph(id = 'muscle-mass-graph'),
        dcc.Graph(id = 'protein-percent-graph'),
        dcc.Graph(id = 'visceral-fat-graph'),
        dcc.Interval(id = 'interval-component', interval = 5 * 1000, n_intervals = 0)  # Cập nhật mỗi 5 giây
    ])

    # Callback cập nhật biểu đồ và dữ liệu mới nhất
    @app.callback(
        [Output('weight-graph', 'figure'),
         Output('bmi-graph', 'figure'),
         Output('bmr-graph', 'figure'),
         Output('tdee-graph', 'figure'),
         Output('lean-body-mass-graph', 'figure'),
         Output('fat-percent-graph', 'figure'),
         Output('water-percent-graph', 'figure'),
         Output('bone-mass-graph', 'figure'),
         Output('muscle-mass-graph', 'figure'),
         Output('protein-percent-graph', 'figure'),
         Output('visceral-fat-graph', 'figure'),
         Output('latest-data', 'children')],
        [Input('interval-component', 'n_intervals')]
    )
    def update_graphs(n):
        df = read_data(csv_file, name)

        # Tạo biểu đồ cho các thông số
        weight_fig = create_graph(df, 'weight', 'Biểu Đồ Theo Dõi Cân Nặng Theo Thời Gian', 'Chỉ số Cân Nặng')
        bmi_fig = create_graph(df, 'bmi', 'Biểu Đồ Theo Dõi BMI Theo Thời Gian','Chỉ số BMI')
        bmr_fig = create_graph(df, 'bmr', 'Biểu Đồ Theo Dõi BMR Theo Thời Gian','Chỉ số BMR')
        tdee_fig = create_graph(df, 'tdee', 'Biểu Đồ Theo Dõi TDEE Theo Thời Gian', 'Chỉ số TDEE')
        lean_body_mass_fig = create_graph(df, 'lean_body_mass', 'Biểu Đồ Theo Cân Nặng Không Mỡ Theo Thời Gian', 'Cân Nặng Cơ Thể Không Mỡ (KG)')
        fat_percent_fig = create_graph(df, 'fat_percentage', 'Biểu Đồ Theo Dõi Phần Trăm Mỡ Theo Thời Gian', 'Phần Trăm Mỡ (%)')
        water_percent_fig = create_graph(df, 'water_percentage', 'Biểu Đồ Theo Dõi Phần Trăm Nước Theo Thời Gian', 'Phần Trăm Nước (%)')
        bone_mass_fig = create_graph(df, 'bone_mass', 'Biểu Đồ Theo Dõi Khối Lượng Xương Theo Thời Gian', 'Khối Lượng Xương (KG)')
        muscle_mass_fig = create_graph(df, 'muscle_mass', 'Biểu Đồ Theo Dõi Khối Lượng Cơ Theo Thời Gian', 'Khối Lượng Cơ (KG)')
        protein_percent_fig = create_graph(df, 'protein_percentage', 'Biểu Đồ Theo Dõi Phần Trăm Đạm Theo Thời Gian', 'Phần Trăm Đạm (%)')
        visceral_fat_fig = create_graph(df, 'visceral_fat', 'Biểu Đồ Theo Dõi Khối Lượng Mỡ Nội Tạng Theo Thời Gian', 'Khối Lượng Mỡ Nội Tạng (KG)')

        # Lấy dữ liệu mới nhất
        latest = df.iloc[-1]  # Dòng cuối cùng
        latest_data = html.Div([
            #html.H2("Latest Data"),
            html.P(f"Ngày theo dõi mới nhất:", style = {'textAlign': 'center', 'font-size': '20px'}),
            html.P(f"{latest['datetime'].strftime('%d/%m/%Y %H:%M')}", style = {'font-weight': 'bold', 'font-size': '24px', 'textAlign': 'center'}),
            html.P(f"Cân nặng:", style = {'textAlign': 'center', 'font-size': '20px'}),
            html.P(f"{latest['weight']} kg", style={'font-weight': 'bold', 'font-size': '24px', 'textAlign': 'center'}),
            html.P(f"BMI:", style = {'textAlign': 'center', 'font-size': '20px'}),
            html.P(f"{latest['bmi']}", style = {'font-weight': 'bold', 'font-size': '24px', 'textAlign': 'center'}),
            html.P(f"TDEE:", style = {'textAlign': 'center', 'font-size': '20px'}),
            html.P(f"{latest['tdee']} kcal", style = {'font-weight': 'bold', 'font-size': '24px', 'textAlign': 'center'})
        ])

        return weight_fig, bmi_fig, bmr_fig, tdee_fig, lean_body_mass_fig, fat_percent_fig, water_percent_fig, bone_mass_fig, muscle_mass_fig, protein_percent_fig, visceral_fat_fig, latest_data

    #threading.Timer(1, lambda: webbrowser.open('http://127.0.0.1:8050')).start()
    # Chạy server
    app.run_server(debug = True)


# Gọi hàm với file csv và tên người dùng
csv_file = 'user_data/user_data.csv'
name = 'Le Dat'
run_dashboard(csv_file, name)