import os
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import GoogleGenerativeAI

# loading the keys

os.environ['LANGCHAIN_API_KEY'] = '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'
os.environ['GOOGLE_API_KEY'] = 'AIzaSyD-axCE2lX9GZcngI2_7STokifQ6LIi1u4'

# Loading the model
llm = GoogleGenerativeAI(model = 'gemini-pro', temperature = 0.1)


def ai_health_recommendations(measurements):
    prompt = ChatPromptTemplate.from_messages([
        ('system',
         'Bạn là một chuyên gia sức khỏe, hãy đưa ra nhận xét chi tiết về tất cả các chỉ số tôi cung cấp và khuyến cáo chuyên sâu về sức khỏe dựa trên các chỉ số cơ thể sau'
         ', chỉ trả lời bằng tiếng Việt, không được định dạng văn bản trong câu trả lời, trả lời bằng những gạch đầu '
         'dòng có chia ra phần nhận xét và khuyến cáo:'),
        ('user',
         f"""Giới tính: {measurements['gender']}, 
            Cân nặng: {measurements['weight']} kg, 
            Tuổi: {measurements['age']} tuổi, 
            BMI: {measurements['bmi']}, 
            BMR: {measurements['bmr']} calo, 
            TDEE: {measurements['tdee']} calo, 
            Khối lượng cơ thể nạc (LBM): {measurements['lbm']} kg, 
            Tỷ lệ mỡ: {measurements['fp']}%, 
            Tỷ lệ nước: {measurements['wp']}%, 
            Khối lượng xương: {measurements['bm']} kg, 
            Khối lượng cơ: {measurements['ms']} kg, 
            Tỷ lệ protein: {measurements['pp']}%, 
            Mỡ nội tạng: {measurements['vf']}."""
         )
    ])

    response = llm.invoke(prompt.format())

    return response
